import { Request, Response } from 'express';
import Prediction from '../models/Prediction.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PAGINATION } from '../constants/index.js';

export const createPrediction = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const prediction = await Prediction.create({ ...req.body, createdBy: req.user.id });
  ApiResponse.created(res, { prediction }, 'Prediction created successfully');
});

export const getPredictions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.disasterType) filter.disasterType = req.query.disasterType;
  if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;

  const [predictions, total] = await Promise.all([
    Prediction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Prediction.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, predictions, total, page, limit, 'Predictions retrieved');
});

export const getPredictionsByState = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { state } = req.params;
  const predictions = await Prediction.find(
    { affectedStates: { $in: [state] } } as Record<string, unknown>
  ).sort({ createdAt: -1 });

  ApiResponse.success(res, { predictions }, `Predictions for ${state} retrieved`);
});
