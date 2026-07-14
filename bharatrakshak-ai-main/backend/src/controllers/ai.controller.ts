import { Request, Response } from 'express';
import { predictFloodRisk, detectDamage, classifySOSPriority } from '../services/ai.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../interfaces/request.js';

export const getFloodPrediction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { state, district, rainfall_mm, temperature_c, humidity, river_level_m, soil_moisture } = req.body;

  if (!state || !district) throw ApiError.badRequest('State and district are required');

  const prediction = await predictFloodRisk({
    state, district,
    rainfall_mm: rainfall_mm || 0,
    temperature_c: temperature_c || 30,
    humidity: humidity || 70,
    river_level_m: river_level_m || 3,
    soil_moisture: soil_moisture || 60,
  });

  ApiResponse.success(res, { prediction }, 'Flood prediction generated');
});

export const getDamageAnalysis = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { imageUrl } = req.body;
  if (!imageUrl) throw ApiError.badRequest('Image URL is required');

  const analysis = await detectDamage({ imageUrl });
  ApiResponse.success(res, { analysis }, 'Damage analysis completed');
});

export const getSOSPriorityClassification = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { emergencyType, description, location, timeOfDay, populationDensity } = req.body;

  if (!emergencyType || !description) throw ApiError.badRequest('Emergency type and description are required');

  const classification = await classifySOSPriority({
    emergencyType, description,
    location: location || { lat: 0, lng: 0 },
    timeOfDay: timeOfDay || new Date().getHours().toString(),
    populationDensity: populationDensity || 'medium',
  });

  ApiResponse.success(res, { classification }, 'SOS priority classified');
});
