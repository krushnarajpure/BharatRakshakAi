import { body } from 'express-validator';
import { DamageType } from '../types/index.js';

export const validateCreateDamageReport = [
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates required'),
  body('damageType').isIn(Object.values(DamageType)).withMessage('Invalid damage type'),
  body('severity').isIn(['critical', 'high', 'moderate', 'low']).withMessage('Invalid severity'),
  body('description').isString().trim().isLength({ min: 10, max: 3000 }).withMessage('Description 10-3000 chars'),
];
