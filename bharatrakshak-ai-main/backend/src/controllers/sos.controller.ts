import { Request, Response } from 'express';
import SOS from '../models/SOS.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PAGINATION } from '../constants/index.js';

export const createSOS = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();

  const sosData = {
    ...req.body,
    userId: req.user.id,
    location: { type: 'Point', coordinates: req.body.location.coordinates },
    priority: req.body.severity || 'moderate',
  };

  const sos = await SOS.create(sosData);
  ApiResponse.created(res, { sos }, 'SOS created successfully');
});

export const getAllSOS = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.emergencyType) filter.emergencyType = req.query.emergencyType;

  // Citizens only see their own SOS; responders see assigned; authority sees all
  if (req.user?.role === 'citizen') {
    filter.userId = req.user.id;
  } else if (req.user?.role === 'responder') {
    filter.assignedResponder = req.user.id;
  }

  const [sosRequests, total] = await Promise.all([
    SOS.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('userId', 'name mobileNumber')
      .populate('assignedResponder', 'name employeeId'),
    SOS.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, sosRequests, total, page, limit, 'SOS requests retrieved');
});

export const getSOSById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const sos = await SOS.findById(req.params.id)
    .populate('userId', 'name mobileNumber')
    .populate('assignedResponder', 'name employeeId');

  if (!sos) throw ApiError.notFound('SOS request not found');
  ApiResponse.success(res, { sos }, 'SOS request retrieved');
});

export const getMySOS = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();

  const sosRequests = await SOS.find({ userId: req.user.id } as Record<string, unknown>)
    .sort({ createdAt: -1 })
    .populate('assignedResponder', 'name employeeId');

  ApiResponse.success(res, { sosRequests }, 'Your SOS requests retrieved');
});

export const updateSOS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const sos = await SOS.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!sos) throw ApiError.notFound('SOS request not found');
  ApiResponse.success(res, { sos }, 'SOS updated successfully');
});

export const deleteSOS = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const sos = await SOS.findByIdAndDelete(req.params.id);
  if (!sos) throw ApiError.notFound('SOS request not found');
  ApiResponse.noContent(res, 'SOS deleted successfully');
});

export const assignResponder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { responderId } = req.body;
  const sos = await SOS.findByIdAndUpdate(
    req.params.id,
    { assignedResponder: responderId, status: 'assigned' },
    { new: true, runValidators: true },
  ).populate('assignedResponder', 'name employeeId');

  if (!sos) throw ApiError.notFound('SOS request not found');
  ApiResponse.success(res, { sos }, 'Responder assigned successfully');
});
