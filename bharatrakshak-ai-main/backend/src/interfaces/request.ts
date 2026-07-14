import { Request } from 'express';
import { UserRole } from '../types';

export interface JwtPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
