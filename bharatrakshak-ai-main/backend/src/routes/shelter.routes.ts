import { Router } from 'express';
import { createShelter, getShelters, getNearbyShelters, getShelterById, updateShelter, deleteShelter } from '../controllers/shelter.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { validateCreateShelter, validateUpdateShelter } from '../validators/shelter.validator.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Public routes (shelters are publicly queryable)
router.get('/', getShelters);
router.get('/nearby', getNearbyShelters);
router.get('/:id', getShelterById);

// Protected routes
router.post('/', protect, authorize(UserRole.AUTHORITY), validateCreateShelter, validate, createShelter);
router.patch('/:id', protect, authorize(UserRole.AUTHORITY), validateUpdateShelter, validate, updateShelter);
router.delete('/:id', protect, authorize(UserRole.AUTHORITY), deleteShelter);

export default router;
