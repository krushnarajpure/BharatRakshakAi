import { body } from 'express-validator';
import { ResourceType } from '../types/index.js';

export const validateCreateResource = [
  body('type').isIn(Object.values(ResourceType)).withMessage('Invalid resource type'),
  body('name').isString().trim().notEmpty().withMessage('Resource name is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates required'),
  body('capacity').optional().isInt({ min: 1 }),
  body('personnel').optional().isInt({ min: 0 }),
];

export const validateUpdateResource = [
  body('status').optional().isString(),
  body('personnel').optional().isInt({ min: 0 }),
];
