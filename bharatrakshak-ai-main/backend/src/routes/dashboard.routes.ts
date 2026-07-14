import { Router } from 'express';
import { getDashboardStats, getResponderDashboard, getCitizenDashboard } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/stats', protect, authorize(UserRole.AUTHORITY), getDashboardStats);
router.get('/responder', protect, authorize(UserRole.RESPONDER), getResponderDashboard);
router.get('/citizen', protect, authorize(UserRole.CITIZEN), getCitizenDashboard);

export default router;
