import { Router } from 'express';
import {
  citizenLogin, responderLogin, authorityLogin,
  register, getMe, logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  validateCitizenLogin, validateResponderLogin,
  validateAuthorityLogin, validateRegister,
} from '../validators/auth.validator.js';

const router = Router();

// Public auth routes (rate limited)
router.post('/citizen-login', authLimiter, validateCitizenLogin, validate, citizenLogin);
router.post('/responder-login', authLimiter, validateResponderLogin, validate, responderLogin);
router.post('/authority-login', authLimiter, validateAuthorityLogin, validate, authorityLogin);
router.post('/register', authLimiter, validateRegister, validate, register);

// Protected auth routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;