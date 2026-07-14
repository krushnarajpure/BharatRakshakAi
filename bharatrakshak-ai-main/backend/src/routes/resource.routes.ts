import { Router } from 'express';
import { createResource, getResources, getResourceById, updateResource, deleteResource } from '../controllers/resource.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';
import { validateCreateResource, validateUpdateResource } from '../validators/resource.validator.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post('/', protect, authorize(UserRole.AUTHORITY), validateCreateResource, validate, createResource);
router.get('/', protect, authorize(UserRole.RESPONDER, UserRole.AUTHORITY), getResources);
router.get('/:id', protect, authorize(UserRole.RESPONDER, UserRole.AUTHORITY), getResourceById);
router.patch('/:id', protect, authorize(UserRole.AUTHORITY), validateUpdateResource, validate, updateResource);
router.delete('/:id', protect, authorize(UserRole.AUTHORITY), deleteResource);

export default router;
