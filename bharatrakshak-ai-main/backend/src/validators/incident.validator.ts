import { body } from 'express-validator';
import { IncidentType, IncidentSeverity } from '../types/index.js';

export const validateCreateIncident = [
  body('type').isIn(Object.values(IncidentType)).withMessage('Invalid incident type'),
  body('severity').isIn(Object.values(IncidentSeverity)).withMessage('Invalid severity'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates required'),
  body('affectedArea').isString().trim().notEmpty().withMessage('Affected area is required'),
  body('description').isString().trim().isLength({ min: 10, max: 3000 }).withMessage('Description 10-3000 chars'),
];

export const validateUpdateIncident = [
  body('status').optional().isString(),
  body('severity').optional().isIn(Object.values(IncidentSeverity)),
  body('casualties').optional().isInt({ min: 0 }),
  body('injured').optional().isInt({ min: 0 }),
  body('evacuated').optional().isInt({ min: 0 }),
];
