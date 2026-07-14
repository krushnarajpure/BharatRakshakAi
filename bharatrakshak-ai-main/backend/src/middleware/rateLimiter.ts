import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../constants';

export const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sosLimiter = rateLimit({
  windowMs: RATE_LIMITS.SOS.windowMs,
  max: RATE_LIMITS.SOS.max,
  message: { success: false, message: 'SOS submission limit reached. Please wait before submitting again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: RATE_LIMITS.UPLOAD.windowMs,
  max: RATE_LIMITS.UPLOAD.max,
  message: { success: false, message: 'Upload limit reached. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
