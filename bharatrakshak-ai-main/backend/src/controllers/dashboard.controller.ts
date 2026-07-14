import { Request, Response } from 'express';
import SOS from '../models/SOS.js';
import Alert from '../models/Alert.js';
import Incident from '../models/Incident.js';
import Resource from '../models/Resource.js';
import Shelter from '../models/Shelter.js';
import RescueTeam from '../models/RescueTeam.js';
import DamageReport from '../models/DamageReport.js';
import User from '../models/User.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();

  const [
    totalSOS, pendingSOS, resolvedSOS,
    activeAlerts, totalIncidents, activeIncidents,
    totalResources, availableResources,
    totalShelters, openShelters, totalShelterCapacity,
    totalTeams, deployedTeams,
    totalDamageReports, pendingDamageReports,
    totalUsers,
  ] = await Promise.all([
    SOS.countDocuments(),
    SOS.countDocuments({ status: 'pending' } as Record<string, unknown>),
    SOS.countDocuments({ status: 'resolved' } as Record<string, unknown>),
    Alert.countDocuments({ isActive: true } as Record<string, unknown>),
    Incident.countDocuments(),
    Incident.countDocuments({ status: { $in: ['reported', 'confirmed', 'responding'] } } as Record<string, unknown>),
    Resource.countDocuments(),
    Resource.countDocuments({ status: 'available' } as Record<string, unknown>),
    Shelter.countDocuments(),
    Shelter.countDocuments({ status: 'open' } as Record<string, unknown>),
    Shelter.aggregate([{ $group: { _id: null, total: { $sum: '$capacity' } } }]),
    RescueTeam.countDocuments(),
    RescueTeam.countDocuments({ status: 'deployed' } as Record<string, unknown>),
    DamageReport.countDocuments(),
    DamageReport.countDocuments({ status: 'submitted' } as Record<string, unknown>),
    User.countDocuments(),
  ]);

  const recentSOS = await SOS.find()
    .sort({ createdAt: -1 }).limit(5)
    .populate('userId', 'name mobileNumber');

  const recentAlerts = await Alert.find({ isActive: true } as Record<string, unknown>)
    .sort({ createdAt: -1 }).limit(5);

  const recentIncidents = await Incident.find()
    .sort({ createdAt: -1 }).limit(5);

  ApiResponse.success(res, {
    overview: {
      sos: { total: totalSOS, pending: pendingSOS, resolved: resolvedSOS },
      alerts: { active: activeAlerts },
      incidents: { total: totalIncidents, active: activeIncidents },
      resources: { total: totalResources, available: availableResources },
      shelters: {
        total: totalShelters,
        open: openShelters,
        totalCapacity: totalShelterCapacity[0]?.total || 0,
      },
      rescueTeams: { total: totalTeams, deployed: deployedTeams },
      damageReports: { total: totalDamageReports, pending: pendingDamageReports },
      users: { total: totalUsers },
    },
    recent: {
      sos: recentSOS,
      alerts: recentAlerts,
      incidents: recentIncidents,
    },
  }, 'Dashboard statistics retrieved');
});

export const getResponderDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();

  const assignedSOS = await SOS.find(
    { assignedResponder: req.user.id, status: { $nin: ['resolved', 'closed'] } } as Record<string, unknown>
  ).sort({ priority: 1, createdAt: -1 }).limit(10);

  const activeAlerts = await Alert.find({ isActive: true } as Record<string, unknown>)
    .sort({ createdAt: -1 }).limit(5);

  ApiResponse.success(res, {
    assignedSOS,
    activeAlerts,
    stats: {
      assignedCount: assignedSOS.length,
    },
  }, 'Responder dashboard retrieved');
});

export const getCitizenDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();

  const mySOS = await SOS.find({ userId: req.user.id } as Record<string, unknown>)
    .sort({ createdAt: -1 }).limit(5);

  const activeAlerts = await Alert.find({ isActive: true } as Record<string, unknown>)
    .sort({ createdAt: -1 }).limit(5);

  const nearbyShelters = await Shelter.find({ status: 'open' } as Record<string, unknown>).limit(5);

  ApiResponse.success(res, {
    mySOS,
    activeAlerts,
    nearbyShelters,
  }, 'Citizen dashboard retrieved');
});
