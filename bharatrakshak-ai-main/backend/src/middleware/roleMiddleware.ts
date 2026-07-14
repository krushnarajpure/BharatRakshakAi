import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces/request';
import { UserRole } from '../types';
import { ApiError } from '../utils/ApiError';

export const authorize = (...roles: (UserRole | string)[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource`));
      return;
    }
    next();
  };
};