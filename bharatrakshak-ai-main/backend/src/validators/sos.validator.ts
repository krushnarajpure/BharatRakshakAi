import { body } from 'express-validator';
import { EmergencyType, SOSPriority } from '../types/index.js';

export const validateCreateSOS = [
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates [longitude, latitude] are required'),
  body('emergencyType')
    .isIn(Object.values(EmergencyType))
    .withMessage(`Emergency type must be one of: ${Object.values(EmergencyType).join(', ')}`),
  body('severity')
    .isIn(Object.values(SOSPriority))
    .withMessage(`Severity must be one of: ${Object.values(SOSPriority).join(', ')}`),
  body('description')
    .isString().trim().isLength({ min: 5, max: 2000 })
    .withMessage('Description must be 5-2000 characters'),
];

export const validateUpdateSOS = [
  body('status').optional().isString().withMessage('Status must be a string'),
  body('priority').optional().isIn(Object.values(SOSPriority)).withMessage('Invalid priority'),
];
