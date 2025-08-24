import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ValidationError } from '@/types';
import { logger } from '@/utils/logger';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error class
export class ValidationErrorClass extends AppError {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

// Handle MongoDB/Mongoose errors
const handleMongooseError = (error: any): AppError => {
  if (error.name === 'ValidationError') {
    const errors: ValidationError[] = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }));
    return new ValidationErrorClass(errors);
  }

  if (error.name === 'CastError') {
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400, 'INVALID_ID');
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return new AppError(`${field} '${value}' already exists`, 409, 'DUPLICATE_FIELD');
  }

  return new AppError('Database error occurred', 500, 'DATABASE_ERROR');
};

// Handle JWT errors
const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
  }

  return new AppError('Authentication failed', 401, 'AUTH_ERROR');
};

// Handle Multer errors (file upload)
const handleMulterError = (error: any): AppError => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size too large', 413, 'FILE_TOO_LARGE');
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files', 400, 'TOO_MANY_FILES');
  }

  return new AppError('File upload error', 400, 'UPLOAD_ERROR');
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: err.message,
    error: err.errorCode || 'ERROR',
    data: {
      stack: err.stack,
      statusCode: err.statusCode
    }
  };

  if (err instanceof ValidationErrorClass) {
    response.data.validationErrors = err.errors;
  }

  res.status(err.statusCode).json(response);
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Only send operational errors to client
  if (err.isOperational) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      error: err.errorCode || 'ERROR'
    };

    if (err instanceof ValidationErrorClass) {
      response.data = { validationErrors: err.errors };
    }

    res.status(err.statusCode).json(response);
  } else {
    // Log error and send generic message
    logger.error('Programming Error:', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: 'INTERNAL_SERVER_ERROR'
    } as ApiResponse);
  }
};

// Global error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.code === 11000) {
    error = handleMongooseError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.code && err.code.startsWith('LIMIT_')) {
    error = handleMulterError(err);
  } else if (!err.isOperational) {
    error = new AppError('Something went wrong!', 500, 'INTERNAL_SERVER_ERROR');
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

// Unhandled promise rejection handler
export const unhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection:', { reason, promise });
    
    // Graceful shutdown
    process.exit(1);
  });
};

// Uncaught exception handler
export const uncaughtExceptionHandler = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    
    // Graceful shutdown
    process.exit(1);
  });
}; 