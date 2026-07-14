import { body } from 'express-validator';

export const validateCreateShelter = [
  body('name').isString().trim().notEmpty().withMessage('Shelter name is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
];

export const validateUpdateShelter = [
  body('name').optional().isString().trim(),
  body('capacity').optional().isInt({ min: 1 }),
  body('currentOccupancy').optional().isInt({ min: 0 }),
  body('status').optional().isString(),
];
