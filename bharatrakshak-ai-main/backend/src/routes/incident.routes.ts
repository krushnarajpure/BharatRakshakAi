import { Router } from 'express';
import { createIncident, getIncidents, getIncidentById, updateIncident, deleteIncident } from '../controllers/incident.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { validateCreateIncident, validateUpdateIncident } from '../validators/incident.validator.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/', protect, authorize(UserRole.AUTHORITY, UserRole.RESPONDER), validateCreateIncident, validate, createIncident);
router.get('/', protect, getIncidents);
router.get('/:id', protect, getIncidentById);
router.patch('/:id', protect, authorize(UserRole.AUTHORITY, UserRole.RESPONDER), validateUpdateIncident, validate, updateIncident);
router.delete('/:id', protect, authorize(UserRole.AUTHORITY), deleteIncident);

export default router;
