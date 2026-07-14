import { Request, Response } from 'express';
import Shelter from '../models/Shelter.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PAGINATION } from '../constants/index.js';

export const createShelter = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const shelterData = {
    ...req.body,
    location: { type: 'Point', coordinates: req.body.location.coordinates },
    managedBy: req.user.id,
  };
  const shelter = await Shelter.create(shelterData);
  ApiResponse.created(res, { shelter }, 'Shelter created successfully');
});

export const getShelters = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;

  const [shelters, total] = await Promise.all([
    Shelter.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Shelter.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, shelters, total, page, limit, 'Shelters retrieved');
});

export const getNearbyShelters = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lng, lat, radius } = req.query;
  if (!lng || !lat) throw ApiError.badRequest('longitude (lng) and latitude (lat) are required');

  const maxDistance = parseInt(radius as string) || 10000; // default 10km
  const shelters = await Shelter.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
        $maxDistance: maxDistance,
      },
    },
  } as Record<string, unknown>).limit(20);

  ApiResponse.success(res, { shelters }, 'Nearby shelters retrieved');
});

export const getShelterById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shelter = await Shelter.findById(req.params.id);
  if (!shelter) throw ApiError.notFound('Shelter not found');
  ApiResponse.success(res, { shelter }, 'Shelter retrieved');
});

export const updateShelter = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shelter = await Shelter.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!shelter) throw ApiError.notFound('Shelter not found');
  ApiResponse.success(res, { shelter }, 'Shelter updated successfully');
});

export const deleteShelter = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const shelter = await Shelter.findByIdAndDelete(req.params.id);
  if (!shelter) throw ApiError.notFound('Shelter not found');
  ApiResponse.noContent(res, 'Shelter deleted successfully');
});
