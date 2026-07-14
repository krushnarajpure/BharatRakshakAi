import { body } from 'express-validator';
import { DisasterType, RiskLevel } from '../types/index.js';

export const validateCreatePrediction = [
  body('disasterType').isIn(Object.values(DisasterType)).withMessage('Invalid disaster type'),
  body('riskLevel').isIn(Object.values(RiskLevel)).withMessage('Invalid risk level'),
  body('confidence').isFloat({ min: 0, max: 100 }).withMessage('Confidence must be 0-100'),
  body('affectedStates').isArray({ min: 1 }).withMessage('At least one affected state required'),
  body('validUntil').isISO8601().withMessage('Valid date required'),
];
