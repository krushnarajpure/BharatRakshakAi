import { Router } from 'express';
import { uploadDamageReport, getDamageReports, getDamageReportById } from '../controllers/damage.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { uploadImages } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/upload', protect, authorize(UserRole.CITIZEN, UserRole.RESPONDER), uploadLimiter, uploadImages.array('images', 5), uploadDamageReport);
router.get('/', protect, getDamageReports);
router.get('/:id', protect, getDamageReportById);

export default router;
