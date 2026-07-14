import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => {
      if (err.type === 'field') {
        return { field: err.path, message: err.msg };
      }
      return { field: 'unknown', message: err.msg };
    });
    throw new ApiError(400, 'Validation failed', true, formattedErrors);
  }
  next();
};
