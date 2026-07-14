import { body } from 'express-validator';
import { AlertSeverity, AlertType } from '../types/index.js';

export const validateCreateAlert = [
  body('title').isString().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('message').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
  body('severity').isIn(Object.values(AlertSeverity)).withMessage('Invalid severity'),
  body('type').isIn(Object.values(AlertType)).withMessage('Invalid alert type'),
  body('affectedAreas').isArray({ min: 1 }).withMessage('At least one affected area is required'),
];

export const validateUpdateAlert = [
  body('title').optional().isString().trim().isLength({ min: 3, max: 200 }),
  body('message').optional().isString().trim(),
  body('severity').optional().isIn(Object.values(AlertSeverity)),
  body('isActive').optional().isBoolean(),
];
