import { Router } from 'express';
import { createPrediction, getPredictions, getPredictionsByState } from '../controllers/prediction.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { validateCreatePrediction } from '../validators/prediction.validator.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/', protect, getPredictions);
router.post('/', protect, authorize(UserRole.AUTHORITY), validateCreatePrediction, validate, createPrediction);
router.get('/:state', protect, getPredictionsByState);

export default router;
