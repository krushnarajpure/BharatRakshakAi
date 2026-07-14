import { body } from 'express-validator';
import { UserRole } from '../types/index.js';

export const validateRegister = [
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage(`Role must be one of: ${Object.values(UserRole).join(', ')}`),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('mobileNumber')
    .optional()
    .isString()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be 10 digits'),
  body('employeeId')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Employee ID cannot be empty'),
  body('officerId')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Officer ID cannot be empty'),
  body('password')
    .optional()
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('teamCode')
    .optional()
    .isString()
    .trim(),
  body('securityPin')
    .optional()
    .isString()
    .trim(),
];

export const validateCitizenLogin = [
  body('mobileNumber')
    .isString()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Valid 10-digit mobile number is required'),
];

export const validateResponderLogin = [
  body('employeeId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required'),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateAuthorityLogin = [
  body('officerId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Officer ID is required'),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
  body('securityPin')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Security PIN is required'),
];
