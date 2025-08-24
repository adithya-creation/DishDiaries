import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { AuthRequest, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

// Middleware to verify JWT token
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'AUTHENTICATION_REQUIRED'
      } as ApiResponse);
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET environment variable is not defined');
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'SERVER_ERROR'
      } as ApiResponse);
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Find user by ID from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
        error: 'INVALID_TOKEN'
      } as ApiResponse);
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account has been deactivated.',
        error: 'ACCOUNT_DEACTIVATED'
      } as ApiResponse);
      return;
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
        error: 'INVALID_TOKEN'
      } as ApiResponse);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token has expired.',
        error: 'TOKEN_EXPIRED'
      } as ApiResponse);
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: 'AUTHENTICATION_FAILED'
    } as ApiResponse);
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id.toString();
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    next();
  }
};

// Middleware to check if user is the owner of a resource
export const checkOwnership = (resourceIdParam: string = 'id') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.',
          error: 'AUTHENTICATION_REQUIRED'
        } as ApiResponse);
        return;
      }

      // This is a generic check - specific ownership validation should be done in controllers
      req.resourceId = resourceId;
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify ownership.',
        error: 'OWNERSHIP_CHECK_FAILED'
      } as ApiResponse);
    }
  };
};

// Middleware to check if user is admin (if you plan to add admin features)
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'AUTHENTICATION_REQUIRED'
    } as ApiResponse);
    return;
  }

  // Add admin role check if you implement user roles
  // For now, this is a placeholder
  if (!req.user.isAdmin) {
    res.status(403).json({
      success: false,
      message: 'Admin access required.',
      error: 'ADMIN_ACCESS_REQUIRED'
    } as ApiResponse);
    return;
  }

  next();
};

// Middleware to check if email is verified
export const requireEmailVerification = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'AUTHENTICATION_REQUIRED'
    } as ApiResponse);
    return;
  }

  if (!req.user.isEmailVerified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required.',
      error: 'EMAIL_VERIFICATION_REQUIRED'
    } as ApiResponse);
    return;
  }

  next();
};

// Helper function to extract token from request
const extractToken = (req: Request): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // Check query parameter (not recommended for production)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }

  return null;
};

// Middleware to attach user info to socket connection
export const socketAuth = async (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.substring(7);

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new Error('Server configuration error'));
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return next(new Error('Invalid token or inactive user'));
    }

    socket.user = user;
    socket.userId = user._id.toString();
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
}; 