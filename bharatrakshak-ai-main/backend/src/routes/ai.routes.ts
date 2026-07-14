import { Router } from 'express';
import { getFloodPrediction, getDamageAnalysis, getSOSPriorityClassification } from '../controllers/ai.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/predict/flood', protect, getFloodPrediction);
router.post('/detect/damage', protect, getDamageAnalysis);
router.post('/classify/sos-priority', protect, getSOSPriorityClassification);

export default router;
