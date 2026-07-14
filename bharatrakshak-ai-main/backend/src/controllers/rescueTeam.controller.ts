import { Request, Response } from 'express';
import RescueTeam from '../models/RescueTeam.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PAGINATION } from '../constants/index.js';

export const createRescueTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const team = await RescueTeam.create({
    ...req.body,
    location: { type: 'Point', coordinates: req.body.location.coordinates },
  });
  ApiResponse.created(res, { team }, 'Rescue team created successfully');
});

export const getRescueTeams = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const [teams, total] = await Promise.all([
    RescueTeam.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('leader', 'name employeeId'),
    RescueTeam.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, teams, total, page, limit, 'Rescue teams retrieved');
});

export const getRescueTeamById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const team = await RescueTeam.findById(req.params.id).populate('leader', 'name employeeId');
  if (!team) throw ApiError.notFound('Rescue team not found');
  ApiResponse.success(res, { team }, 'Rescue team retrieved');
});

export const updateRescueTeam = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const team = await RescueTeam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!team) throw ApiError.notFound('Rescue team not found');
  ApiResponse.success(res, { team }, 'Rescue team updated successfully');
});

export const deleteRescueTeam = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const team = await RescueTeam.findByIdAndDelete(req.params.id);
  if (!team) throw ApiError.notFound('Rescue team not found');
  ApiResponse.noContent(res, 'Rescue team deleted successfully');
});
