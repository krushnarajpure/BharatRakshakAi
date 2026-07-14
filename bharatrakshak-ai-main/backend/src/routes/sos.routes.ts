import { Router } from 'express';
import { createSOS, getAllSOS, getSOSById, getMySOS, updateSOS, deleteSOS, assignResponder } from '../controllers/sos.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { sosLimiter } from '../middleware/rateLimiter.js';
import { validateCreateSOS, validateUpdateSOS } from '../validators/sos.validator.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/', protect, authorize(UserRole.CITIZEN), sosLimiter, validateCreateSOS, validate, createSOS);
router.get('/', protect, getAllSOS);
router.get('/my', protect, authorize(UserRole.CITIZEN), getMySOS);
router.get('/:id', protect, getSOSById);
router.patch('/:id', protect, authorize(UserRole.RESPONDER, UserRole.AUTHORITY), validateUpdateSOS, validate, updateSOS);
router.delete('/:id', protect, authorize(UserRole.AUTHORITY), deleteSOS);
router.patch('/:id/assign', protect, authorize(UserRole.AUTHORITY), assignResponder);

export default router;
