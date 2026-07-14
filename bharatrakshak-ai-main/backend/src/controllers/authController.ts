import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { appConfig } from '../config/constants.js';

// ─── Helper: Generate JWT ─────────────────────────────────────────────────────

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn,
  } as jwt.SignOptions);
};

// ─── Citizen Login ────────────────────────────────────────────────────────────

export const citizenLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { mobileNumber } = req.body;

  let user = await User.findOne({ mobileNumber, role: 'citizen' } as Record<string, unknown>);

  if (!user) {
    user = await User.create({ role: 'citizen', mobileNumber });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(String(user._id), user.role);

  ApiResponse.success(res, {
    token,
    role: 'citizen',
    userId: user._id,
    user: {
      id: user._id,
      role: user.role,
      name: user.name,
      mobileNumber: user.mobileNumber,
    },
  }, 'Citizen login successful');
});

// ─── Responder Login ──────────────────────────────────────────────────────────

export const responderLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { employeeId, password } = req.body;

  const user = await User.findOne(
    { employeeId, role: 'responder' } as Record<string, unknown>
  ).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid Employee ID');
  }

  const isMatch = await bcrypt.compare(password, user.password || '');
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid Password');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(String(user._id), user.role);

  ApiResponse.success(res, {
    token,
    role: user.role,
    userId: user._id,
    user: {
      id: user._id,
      role: user.role,
      name: user.name,
      employeeId: user.employeeId,
    },
  }, 'Responder login successful');
});

// ─── Authority Login ──────────────────────────────────────────────────────────

export const authorityLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { officerId, password, securityPin } = req.body;

  const user = await User.findOne(
    { officerId, role: 'authority' } as Record<string, unknown>
  ).select('+password +securityPin');

  if (!user) {
    throw ApiError.unauthorized('Invalid Officer ID');
  }

  const isMatch = await bcrypt.compare(password, user.password || '');
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid Password');
  }

  if (user.securityPin !== securityPin) {
    throw ApiError.unauthorized('Invalid Security PIN');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(String(user._id), user.role);

  ApiResponse.success(res, {
    token,
    role: user.role,
    userId: user._id,
    user: {
      id: user._id,
      role: user.role,
      name: user.name,
      officerId: user.officerId,
    },
  }, 'Authority login successful');
});

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    role, name, mobileNumber, employeeId,
    officerId, password, teamCode, securityPin,
  } = req.body;

  // Check duplicates
  if (mobileNumber) {
    const existing = await User.findOne({ mobileNumber } as Record<string, unknown>);
    if (existing) throw ApiError.conflict('Mobile number already registered');
  }
  if (employeeId) {
    const existing = await User.findOne({ employeeId } as Record<string, unknown>);
    if (existing) throw ApiError.conflict('Employee ID already registered');
  }
  if (officerId) {
    const existing = await User.findOne({ officerId } as Record<string, unknown>);
    if (existing) throw ApiError.conflict('Officer ID already registered');
  }

  const hashedPassword = password
    ? await bcrypt.hash(password, 10)
    : undefined;

  const user = await User.create({
    role, name, mobileNumber, employeeId,
    officerId, password: hashedPassword, teamCode, securityPin,
  });

  ApiResponse.created(res, {
    user: { id: user._id, role: user.role, name: user.name },
  }, 'Registration successful');
});

// ─── Get Current User ─────────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, { user }, 'User profile retrieved');
});

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  ApiResponse.success(res, null, 'Logged out successfully');
});