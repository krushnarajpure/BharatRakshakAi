import { Router } from 'express';
import authRoutes from './authRoutes.js';
import sosRoutes from './sos.routes.js';
import alertRoutes from './alert.routes.js';
import shelterRoutes from './shelter.routes.js';
import incidentRoutes from './incident.routes.js';
import resourceRoutes from './resource.routes.js';
import rescueTeamRoutes from './rescueTeam.routes.js';
import predictionRoutes from './prediction.routes.js';
import damageRoutes from './damage.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import notificationRoutes from './notification.routes.js';
import aiRoutes from './ai.routes.js';

const router = Router();

// ─── Module Routes ────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/sos', sosRoutes);
router.use('/alerts', alertRoutes);
router.use('/shelters', shelterRoutes);
router.use('/incidents', incidentRoutes);
router.use('/resources', resourceRoutes);
router.use('/rescue-teams', rescueTeamRoutes);
router.use('/predictions', predictionRoutes);
router.use('/damage-reports', damageRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);

export default router;