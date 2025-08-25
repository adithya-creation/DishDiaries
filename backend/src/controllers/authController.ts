import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest, ApiResponse } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Register user
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }]
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      return next(new AppError('Email already registered', 409, 'EMAIL_ALREADY_EXISTS'));
    }
    if (existingUser.username === username) {
      return next(new AppError('Username already taken', 409, 'USERNAME_ALREADY_EXISTS'));
    }
  }

  // Create new user
  const user = new User({
    username,
    email: email.toLowerCase(),
    password
  });

  await user.save();

  // Generate JWT token
  const token = user.generateJWT();

  // Remove password from response
  const userResponse = user.toJSON();

  logger.info('User registered successfully', {
    userId: user._id,
    username: user.username,
    email: user.email
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      token
    }
  } as ApiResponse);
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account has been deactivated', 401, 'ACCOUNT_DEACTIVATED'));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = user.generateJWT();

  // Remove password from response
  const userResponse = user.toJSON();

  logger.info('User logged in successfully', {
    userId: user._id,
    username: user.username,
    email: user.email
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token
    }
  } as ApiResponse);
});

// Logout user (client-side token removal, server-side could implement token blacklisting)
export const logout = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  logger.info('User logged out', {
    userId: req.userId,
    username: req.user?.username
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  } as ApiResponse);
});

// Get current user profile
export const getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.userId)
    .populate('recipeCount')
    .select('-password');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: { user }
  } as ApiResponse);
});

// Update user profile
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { username, bio } = req.body;
  const userId = req.userId;

  // Check if username is taken (excluding current user)
  if (username) {
    const existingUser = await User.findOne({
      username,
      _id: { $ne: userId }
    });

    if (existingUser) {
      return next(new AppError('Username already taken', 409, 'USERNAME_ALREADY_EXISTS'));
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { ...(username && { username }), ...(bio !== undefined && { bio }) },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  logger.info('User profile updated', {
    userId: user._id,
    changes: { username, bio }
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  } as ApiResponse);
});

// Change password
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  // Find user with password
  const user = await User.findById(userId).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD'));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info('User password changed', { userId: user._id });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  } as ApiResponse);
});

// Deactivate account
export const deactivateAccount = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  logger.info('User account deactivated', { userId: user._id });

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  } as ApiResponse);
});

// Follow user
export const followUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id: targetUserId } = req.params;
  const currentUserId = req.userId;

  if (targetUserId === currentUserId) {
    return next(new AppError('Cannot follow yourself', 400, 'CANNOT_FOLLOW_SELF'));
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Check if already following
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    return next(new AppError('Current user not found', 404, 'USER_NOT_FOUND'));
  }

  if (currentUser.following.some(id => id.toString() === targetUserId)) {
    return next(new AppError('Already following this user', 400, 'ALREADY_FOLLOWING'));
  }

  // Add to following/followers lists
  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } }),
    User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } })
  ]);

  logger.info('User followed', {
    followerId: currentUserId,
    followingId: targetUserId
  });

  res.status(200).json({
    success: true,
    message: 'User followed successfully'
  } as ApiResponse);
});

// Unfollow user
export const unfollowUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id: targetUserId } = req.params;
  const currentUserId = req.userId;

  if (targetUserId === currentUserId) {
    return next(new AppError('Cannot unfollow yourself', 400, 'CANNOT_UNFOLLOW_SELF'));
  }

  // Check if currently following
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    return next(new AppError('Current user not found', 404, 'USER_NOT_FOUND'));
  }

  if (!currentUser.following.some(id => id.toString() === targetUserId)) {
    return next(new AppError('Not following this user', 400, 'NOT_FOLLOWING'));
  }

  // Remove from following/followers lists
  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } }),
    User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } })
  ]);

  logger.info('User unfollowed', {
    followerId: currentUserId,
    unfollowingId: targetUserId
  });

  res.status(200).json({
    success: true,
    message: 'User unfollowed successfully'
  } as ApiResponse);
}); 