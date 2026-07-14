import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../interfaces/request';
import { ApiError } from '../utils/ApiError';
import { appConfig } from '../config/constants';

export const protect = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    const decoded = jwt.verify(token, appConfig.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) { next(error); return; }
    if (error instanceof jwt.JsonWebTokenError) { next(ApiError.unauthorized('Invalid token')); return; }
    if (error instanceof jwt.TokenExpiredError) { next(ApiError.unauthorized('Token expired')); return; }
    next(ApiError.unauthorized('Authentication failed'));
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, appConfig.jwt.secret) as JwtPayload;
        req.user = decoded;
      }
    }
  } catch {
    // Token invalid — proceed without user
  }
  next();
};