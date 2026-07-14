import { Router } from 'express';
import { createAlert, getAlerts, getAlertById, updateAlert, deleteAlert } from '../controllers/alert.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { validateCreateAlert, validateUpdateAlert } from '../validators/alert.validator.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/', protect, authorize(UserRole.AUTHORITY), validateCreateAlert, validate, createAlert);
router.get('/', protect, getAlerts);
router.get('/:id', protect, getAlertById);
router.patch('/:id', protect, authorize(UserRole.AUTHORITY), validateUpdateAlert, validate, updateAlert);
router.delete('/:id', protect, authorize(UserRole.AUTHORITY), deleteAlert);

export default router;
