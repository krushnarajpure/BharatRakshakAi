import { Request, Response } from 'express';
import Incident from '../models/Incident.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PAGINATION } from '../constants/index.js';

export const createIncident = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const incident = await Incident.create({
    ...req.body,
    location: { type: 'Point', coordinates: req.body.location.coordinates },
    reportedBy: req.user.id,
  });
  ApiResponse.created(res, { incident }, 'Incident reported successfully');
});

export const getIncidents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.status) filter.status = req.query.status;

  const [incidents, total] = await Promise.all([
    Incident.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('reportedBy', 'name').populate('assignedTeams', 'name type status'),
    Incident.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, incidents, total, page, limit, 'Incidents retrieved');
});

export const getIncidentById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const incident = await Incident.findById(req.params.id)
    .populate('reportedBy', 'name').populate('assignedTeams', 'name type status');
  if (!incident) throw ApiError.notFound('Incident not found');
  ApiResponse.success(res, { incident }, 'Incident retrieved');
});

export const updateIncident = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!incident) throw ApiError.notFound('Incident not found');
  ApiResponse.success(res, { incident }, 'Incident updated successfully');
});

export const deleteIncident = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const incident = await Incident.findByIdAndDelete(req.params.id);
  if (!incident) throw ApiError.notFound('Incident not found');
  ApiResponse.noContent(res, 'Incident deleted successfully');
});
