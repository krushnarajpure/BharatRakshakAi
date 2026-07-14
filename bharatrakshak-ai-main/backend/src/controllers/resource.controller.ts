import { Request, Response } from 'express';
import Resource from '../models/Resource.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PAGINATION } from '../constants/index.js';

export const createResource = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const resource = await Resource.create({
    ...req.body,
    location: { type: 'Point', coordinates: req.body.location.coordinates },
  });
  ApiResponse.created(res, { resource }, 'Resource created successfully');
});

export const getResources = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.state) filter.state = req.query.state;

  const [resources, total] = await Promise.all([
    Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resource.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, resources, total, page, limit, 'Resources retrieved');
});

export const getResourceById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw ApiError.notFound('Resource not found');
  ApiResponse.success(res, { resource }, 'Resource retrieved');
});

export const updateResource = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!resource) throw ApiError.notFound('Resource not found');
  ApiResponse.success(res, { resource }, 'Resource updated successfully');
});

export const deleteResource = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const resource = await Resource.findByIdAndDelete(req.params.id);
  if (!resource) throw ApiError.notFound('Resource not found');
  ApiResponse.noContent(res, 'Resource deleted successfully');
});
