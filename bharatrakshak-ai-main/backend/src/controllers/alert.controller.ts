import { Request, Response } from 'express';
import Alert from '../models/Alert.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PAGINATION } from '../constants/index.js';

export const createAlert = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const alert = await Alert.create({ ...req.body, createdBy: req.user.id });
  ApiResponse.created(res, { alert }, 'Alert created successfully');
});

export const getAlerts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.active === 'true') filter.isActive = true;

  const [alerts, total] = await Promise.all([
    Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('createdBy', 'name officerId'),
    Alert.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, alerts, total, page, limit, 'Alerts retrieved');
});

export const getAlertById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const alert = await Alert.findById(req.params.id).populate('createdBy', 'name officerId');
  if (!alert) throw ApiError.notFound('Alert not found');
  ApiResponse.success(res, { alert }, 'Alert retrieved');
});

export const updateAlert = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!alert) throw ApiError.notFound('Alert not found');
  ApiResponse.success(res, { alert }, 'Alert updated successfully');
});

export const deleteAlert = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const alert = await Alert.findByIdAndDelete(req.params.id);
  if (!alert) throw ApiError.notFound('Alert not found');
  ApiResponse.noContent(res, 'Alert deleted successfully');
});
