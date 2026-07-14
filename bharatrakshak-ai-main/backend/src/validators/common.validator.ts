import { body, param, query } from 'express-validator';

export const validateMongoId = (field = 'id') =>
  param(field).isMongoId().withMessage(`Invalid ${field} format`);

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const validateOptionalLocation = [
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),
  body('location.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Coordinates must be numbers'),
];
