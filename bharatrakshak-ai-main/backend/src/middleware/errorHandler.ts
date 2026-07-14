import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { ApiResponseBody } from '../interfaces/response';

export const globalErrorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID format';
    isOperational = true;
  }

  if ('code' in err && (err as Record<string, unknown>).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value. This resource already exists.';
    isOperational = true;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  if (!isOperational) {
    logger.error('Unexpected error:', err);
  }

  const body: ApiResponseBody = { success: false, message };
  if (process.env.NODE_ENV !== 'production') {
    body.error = err.stack;
  }

  res.status(statusCode).json(body);
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
