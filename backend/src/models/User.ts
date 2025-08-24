import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance (email and username indexes are auto-created by unique: true)
UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });

// Virtual for follower count
UserSchema.virtual('followerCount').get(function() {
  return this.followers && this.followers.length ? this.followers.length : 0;
});

// Virtual for following count
UserSchema.virtual('followingCount').get(function() {
  return this.following && this.following.length ? this.following.length : 0;
});

// Virtual for recipe count
UserSchema.virtual('recipeCount', {
  ref: 'Recipe',
  localField: '_id',
  foreignField: 'author',
  count: true
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Password hashing failed');
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate JWT
UserSchema.methods.generateJWT = function(): string {
  const payload = {
    id: this._id,
    username: this.username,
    email: this.email
  };

  const secret = process.env.JWT_SECRET as string;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return (jwt as any).sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Method to generate password reset token
UserSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Method to generate email verification token
UserSchema.methods.generateEmailVerificationToken = function(): string {
  const verificationToken = require('crypto').randomBytes(32).toString('hex');
  
  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  return verificationToken;
};

// Static method to find user by email or username
UserSchema.statics.findByEmailOrUsername = function(identifier: string) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
};

// Static method to check if username is taken
UserSchema.statics.isUsernameTaken = async function(username: string, excludeId?: string) {
  const query: any = { username };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const user = await this.findOne(query);
  return !!user;
};

// Static method to check if email is taken
UserSchema.statics.isEmailTaken = async function(email: string, excludeId?: string) {
  const query: any = { email: email.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const user = await this.findOne(query);
  return !!user;
};

// Remove password and sensitive fields from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.__v;
  return userObject;
};

export const User = mongoose.model<IUser>('User', UserSchema); 