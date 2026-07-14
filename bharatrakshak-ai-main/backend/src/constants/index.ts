import { UserRole } from '../types';

// ─── Role Permissions ─────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.CITIZEN]: [
    'sos:create', 'sos:read:own', 'alert:read', 'prediction:read',
    'shelter:read', 'damage:create', 'damage:read:own', 'notification:read',
  ],
  [UserRole.RESPONDER]: [
    'sos:read:assigned', 'sos:update:status', 'resource:read',
    'incident:read', 'incident:create', 'incident:update',
    'rescue-team:read', 'shelter:read', 'alert:read', 'prediction:read',
    'notification:read', 'damage:create', 'damage:read',
  ],
  [UserRole.AUTHORITY]: [
    'sos:read', 'sos:update', 'sos:delete', 'sos:assign',
    'alert:create', 'alert:update', 'alert:delete', 'alert:read',
    'prediction:read', 'prediction:create',
    'shelter:create', 'shelter:update', 'shelter:delete', 'shelter:read',
    'incident:create', 'incident:read', 'incident:update', 'incident:delete',
    'resource:create', 'resource:read', 'resource:update', 'resource:delete',
    'rescue-team:create', 'rescue-team:read', 'rescue-team:update', 'rescue-team:delete',
    'damage:read', 'damage:update', 'user:manage', 'dashboard:read', 'notification:read',
  ],
};

// ─── Pagination Defaults ──────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── File Upload ──────────────────────────────────────────────────────────────

export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_FILES: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],
} as const;

// ─── Rate Limits ──────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  AUTH: { windowMs: 15 * 60 * 1000, max: 20 },
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
  SOS: { windowMs: 60 * 1000, max: 5 },
  UPLOAD: { windowMs: 60 * 1000, max: 10 },
} as const;

// ─── JWT ──────────────────────────────────────────────────────────────────────

export const JWT_CONSTANTS = {
  EXPIRY: '7d',
  COOKIE_NAME: 'bharatrakshak_token',
} as const;
