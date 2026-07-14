import { Request, Response } from 'express';
import DamageReport from '../models/DamageReport.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { PAGINATION } from '../constants/index.js';

export const uploadDamageReport = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();

  // Upload images to Cloudinary if present
  const imageUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file.buffer, 'bharatrakshak/damage');
        imageUrls.push(result.url);
      } catch {
        // If Cloudinary is not configured, store placeholder
        imageUrls.push(`/uploads/damage/${file.originalname}`);
      }
    }
  }

  const report = await DamageReport.create({
    ...req.body,
    reportedBy: req.user.id,
    location: req.body.location
      ? { type: 'Point', coordinates: JSON.parse(req.body.location).coordinates || req.body.location.coordinates }
      : { type: 'Point', coordinates: [0, 0] },
    images: imageUrls,
  });

  ApiResponse.created(res, { report }, 'Damage report submitted successfully');
});

export const getDamageReports = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.damageType) filter.damageType = req.query.damageType;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.severity) filter.severity = req.query.severity;

  const [reports, total] = await Promise.all([
    DamageReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('reportedBy', 'name'),
    DamageReport.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, reports, total, page, limit, 'Damage reports retrieved');
});

export const getDamageReportById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const report = await DamageReport.findById(req.params.id)
    .populate('reportedBy', 'name')
    .populate('verifiedBy', 'name officerId');
  if (!report) throw ApiError.notFound('Damage report not found');
  ApiResponse.success(res, { report }, 'Damage report retrieved');
});
