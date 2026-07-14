# BharatRakshak AI — Production Backend Implementation

## Overview

Build a complete, production-ready Express.js + TypeScript + MongoDB backend for the BharatRakshak AI national disaster management platform. The backend must integrate with the existing Next.js 15 frontend (which currently uses mock data and has basic auth wired to `localhost:5000`).

## Current State Analysis

The existing backend has:
- Basic Express server at `src/server.ts`
- MongoDB connection via Mongoose at `src/config/db.ts`
- A `User` model with role-based fields (citizen, responder, authority)
- Auth controllers for citizen-login, responder-login, authority-login, register
- JWT `protect` middleware and `authorize` role middleware
- Auth routes already wired to the frontend

**What's missing**: All domain modules (SOS, Predictions, Damage, Alerts, Shelters, Incidents, Resources, Rescue Teams, Notifications), validation, error handling, security hardening, file uploads, service abstractions, and proper TypeScript types.

## Frontend API Compatibility

The frontend currently calls:
- `POST http://localhost:5000/api/auth/citizen-login` — existing ✅
- `POST http://localhost:5000/api/auth/responder-login` — existing ✅
- `POST http://localhost:5000/api/auth/authority-login` — existing ✅
- `POST /api/auth/register` — existing ✅
- All other pages use mock/hardcoded data — need backend endpoints

> [!IMPORTANT]
> The existing auth routes and User model will be preserved and enhanced (not replaced) to maintain frontend compatibility. New fields (email, phone, profileImage, location) will be added as optional to avoid breaking existing users.

## Proposed Changes

### 1. Foundation & Configuration

#### [MODIFY] [package.json](file:///Ubuntu/home/lenovo/projects/bharatrakshak-ai/backend/package.json)
- Add missing dependencies: `helmet`, `morgan`, `compression`, `express-rate-limit`, `express-validator`, `multer`, `cloudinary`, `http-status-codes`
- Add dev dependencies: `@types/multer`, `@types/morgan`, `@types/compression`
- Add `lint` and `seed` scripts

#### [MODIFY] [tsconfig.json](file:///Ubuntu/home/lenovo/projects/bharatrakshak-ai/backend/tsconfig.json)
- Add `resolveJsonModule`, `declaration`, `declarationMap`, `sourceMap`, `baseUrl`, `paths` for clean imports

#### [NEW] [.env.example](file:///Ubuntu/home/lenovo/projects/bharatrakshak-ai/backend/.env.example)
- Template for all environment variables (PORT, MONGODB_URI, JWT_SECRET, CLOUDINARY_*, FASTAPI_URL, etc.)

#### [NEW] [README.md](file:///Ubuntu/home/lenovo/projects/bharatrakshak-ai/backend/README.md)
- Complete project documentation with setup, API reference, architecture overview

---

### 2. Types & Interfaces

#### [NEW] `src/types/index.ts`
- Enums for `UserRole`, `SOSPriority`, `SOSStatus`, `AlertSeverity`, `IncidentType`, `ResourceType`, `ShelterStatus`, `MissionStatus`

#### [NEW] `src/interfaces/index.ts`
- TypeScript interfaces for all MongoDB documents: `IUser`, `ISOS`, `IPrediction`, `IDamageReport`, `IAlert`, `IShelter`, `IIncident`, `IResource`, `IRescueTeam`, `INotification`

#### [NEW] `src/interfaces/request.ts`
- `AuthenticatedRequest` extending Express Request with typed user payload

#### [NEW] `src/interfaces/response.ts`
- `ApiResponse<T>` generic interface for consistent response format

---

### 3. Constants

#### [NEW] `src/constants/index.ts`
- Role permissions map, disaster types, Indian states, resource categories, severity levels, status enums

---

### 4. Utility Layer

#### [NEW] `src/utils/asyncHandler.ts`
- Wraps async route handlers to catch errors automatically

#### [NEW] `src/utils/ApiError.ts`
- Custom error class with statusCode, message, isOperational

#### [NEW] `src/utils/ApiResponse.ts`
- Standard `{ success, message, data }` response builder

#### [NEW] `src/utils/logger.ts`
- Structured logging utility

---

### 5. Configuration

#### [MODIFY] `src/config/db.ts`
- Add connection options for production (retryWrites, connection pooling, event listeners)

#### [NEW] `src/config/cloudinary.ts`
- Cloudinary SDK initialization

#### [NEW] `src/config/constants.ts`
- App-wide constants (pagination defaults, file size limits, etc.)

---

### 6. MongoDB Models (10 collections)

#### [MODIFY] `src/models/User.ts`
- Add optional fields: `email`, `phone`, `profileImage`, `location` (GeoJSON), `isActive`, `lastLogin`
- Add password hashing pre-save hook (currently done in controller)
- Add `comparePassword` instance method

#### [NEW] `src/models/SOS.ts`
- Fields: `userId`, `location` (GeoJSON), `description`, `images[]`, `videos[]`, `emergencyType`, `severity`, `priority`, `status` (pending/assigned/in-progress/resolved/closed), `assignedResponder`, `contacts[]`, `aiAssessment`, timestamps
- Indexes on `status`, `priority`, `location` (2dsphere), `userId`

#### [NEW] `src/models/Prediction.ts`
- Fields: `disasterType`, `riskLevel`, `confidence`, `affectedStates[]`, `affectedDistricts[]`, `trend`, `forecastData`, `modelUsed`, `dataSource`, `validUntil`, timestamps
- Index on `disasterType`, `riskLevel`

#### [NEW] `src/models/DamageReport.ts`
- Fields: `reportedBy`, `location` (GeoJSON), `images[]`, `damageType`, `severity`, `description`, `aiAnalysis` (for YOLOv8 results), `estimatedCost`, `status`, timestamps

#### [NEW] `src/models/Alert.ts`
- Fields: `title`, `message`, `severity`, `type`, `affectedAreas[]`, `isActive`, `createdBy`, `expiresAt`, timestamps

#### [NEW] `src/models/Shelter.ts`
- Fields: `name`, `location` (GeoJSON with lat/lng), `capacity`, `currentOccupancy`, `status`, `amenities[]`, `contactNumber`, `managedBy`, timestamps

#### [NEW] `src/models/Incident.ts`
- Fields: `type`, `severity`, `location` (GeoJSON), `status`, `affectedArea`, `description`, `reportedBy`, `assignedTeams[]`, `casualties`, `evacuated`, timestamps

#### [NEW] `src/models/Resource.ts`
- Fields: `type` (ambulance/fire_truck/medical_team/rescue_boat/helicopter/ndrf_team), `name`, `status` (available/deployed/maintenance), `location` (GeoJSON), `assignedTo`, `capacity`, timestamps

#### [NEW] `src/models/RescueTeam.ts`
- Fields: `name`, `type`, `members[]`, `leader`, `status`, `currentMission`, `location` (GeoJSON), `equipment[]`, timestamps

#### [NEW] `src/models/Notification.ts`
- Fields: `recipient`, `type`, `title`, `message`, `isRead`, `relatedEntity` (polymorphic ref), timestamps

---

### 7. Validators

#### [NEW] `src/validators/auth.validator.ts`
- Validate register, login request bodies using express-validator

#### [NEW] `src/validators/sos.validator.ts`
- Validate SOS creation (location required, valid severity, etc.)

#### [NEW] `src/validators/prediction.validator.ts`

#### [NEW] `src/validators/damage.validator.ts`

#### [NEW] `src/validators/alert.validator.ts`

#### [NEW] `src/validators/shelter.validator.ts`

#### [NEW] `src/validators/incident.validator.ts`

#### [NEW] `src/validators/resource.validator.ts`

#### [NEW] `src/validators/common.validator.ts`
- Shared validation chains (mongoId, pagination, etc.)

---

### 8. Middleware

#### [MODIFY] `src/middleware/authMiddleware.ts`
- Better typing with `AuthenticatedRequest`
- Fetch full user from DB and attach to request

#### [MODIFY] `src/middleware/roleMiddleware.ts`
- Enhance with typed roles using `UserRole` enum

#### [NEW] `src/middleware/errorHandler.ts`
- Global error handler, 404 handler, validation error formatter

#### [NEW] `src/middleware/upload.ts`
- Multer configuration with file filtering, size limits, Cloudinary integration

#### [NEW] `src/middleware/rateLimiter.ts`
- Rate limiting per endpoint category (auth: strict, general: moderate)

#### [NEW] `src/middleware/validate.ts`
- Express-validator result checker middleware

---

### 9. Service Layer (AI Integration Abstraction)

#### [NEW] `src/services/prediction.service.ts`
- Abstract interface for prediction operations
- Mock implementation now, ready for FastAPI proxy later

#### [NEW] `src/services/damage.service.ts`
- Abstract interface for damage analysis
- Placeholder for YOLOv8 integration

#### [NEW] `src/services/sos.service.ts`
- SOS priority scoring, auto-assignment logic

#### [NEW] `src/services/notification.service.ts`
- Create notifications for users on events

#### [NEW] `src/services/ai.service.ts`
- Base AI service client (will proxy to FastAPI)
- Health check, prediction request, damage analysis request stubs

---

### 10. Controllers

#### [MODIFY] `src/controllers/authController.ts`
- Add `getMe`, `logout` endpoints
- Enhance error handling with `ApiError`

#### [NEW] `src/controllers/sos.controller.ts`
- `createSOS`, `getAllSOS`, `getSOSById`, `updateSOS`, `deleteSOS`, `getMySOSRequests`, `assignResponder`

#### [NEW] `src/controllers/prediction.controller.ts`
- `getPredictions`, `createPrediction`, `getPredictionsByState`

#### [NEW] `src/controllers/damage.controller.ts`
- `uploadDamageReport`, `getAllDamageReports`, `getDamageReportById`

#### [NEW] `src/controllers/alert.controller.ts`
- `createAlert`, `getAlerts`, `updateAlert`, `deleteAlert`

#### [NEW] `src/controllers/shelter.controller.ts`
- CRUD operations with GeoJSON queries (find nearest shelters)

#### [NEW] `src/controllers/incident.controller.ts`
- CRUD with filtering by type, severity, status

#### [NEW] `src/controllers/resource.controller.ts`
- CRUD with status tracking and deployment assignment

#### [NEW] `src/controllers/rescueTeam.controller.ts`
- CRUD with mission management

#### [NEW] `src/controllers/notification.controller.ts`
- Get user notifications, mark as read

#### [NEW] `src/controllers/dashboard.controller.ts`
- Aggregate stats for the dashboard (counts, recent SOS, active incidents, etc.)

---

### 11. Routes

#### [MODIFY] `src/routes/index.ts`
- Register all sub-routers

#### [MODIFY] `src/routes/authRoutes.ts`
- Add `GET /me`, `POST /logout`

#### [NEW] `src/routes/sos.routes.ts`
#### [NEW] `src/routes/prediction.routes.ts`
#### [NEW] `src/routes/damage.routes.ts`
#### [NEW] `src/routes/alert.routes.ts`
#### [NEW] `src/routes/shelter.routes.ts`
#### [NEW] `src/routes/incident.routes.ts`
#### [NEW] `src/routes/resource.routes.ts`
#### [NEW] `src/routes/rescueTeam.routes.ts`
#### [NEW] `src/routes/notification.routes.ts`
#### [NEW] `src/routes/dashboard.routes.ts`

---

### 12. Application Entry Points

#### [MODIFY] `src/server.ts`
- Graceful shutdown handler
- Unhandled rejection / uncaught exception handlers
- Separate app creation from server start

#### [NEW] `src/app.ts`
- Express app factory with all middleware: helmet, cors, morgan, compression, rate limiting, body parsing, routes, error handling

---

## Complete API Route Map

| Method | Endpoint | Auth | Roles | Purpose |
|--------|----------|------|-------|---------|
| POST | `/api/auth/citizen-login` | No | — | Citizen OTP-less login |
| POST | `/api/auth/responder-login` | No | — | Responder credential login |
| POST | `/api/auth/authority-login` | No | — | Authority credential login |
| POST | `/api/auth/register` | No | — | Register new user |
| POST | `/api/auth/logout` | Yes | All | Logout |
| GET | `/api/auth/me` | Yes | All | Get current user |
| POST | `/api/sos` | Yes | citizen | Create SOS |
| GET | `/api/sos` | Yes | All | List SOS (filtered by role) |
| GET | `/api/sos/my` | Yes | citizen | My SOS requests |
| GET | `/api/sos/:id` | Yes | All | Get SOS detail |
| PATCH | `/api/sos/:id` | Yes | responder, authority | Update SOS |
| DELETE | `/api/sos/:id` | Yes | authority | Delete SOS |
| PATCH | `/api/sos/:id/assign` | Yes | authority | Assign responder |
| GET | `/api/predictions` | Yes | All | List predictions |
| POST | `/api/predictions` | Yes | authority | Create prediction |
| GET | `/api/predictions/:state` | Yes | All | Predictions by state |
| POST | `/api/damage/upload` | Yes | citizen, responder | Upload damage report |
| GET | `/api/damage` | Yes | All | List damage reports |
| GET | `/api/damage/:id` | Yes | All | Get damage report |
| POST | `/api/alerts` | Yes | authority | Create alert |
| GET | `/api/alerts` | Yes | All | List alerts |
| GET | `/api/alerts/:id` | Yes | All | Get alert detail |
| PATCH | `/api/alerts/:id` | Yes | authority | Update alert |
| DELETE | `/api/alerts/:id` | Yes | authority | Delete alert |
| POST | `/api/shelters` | Yes | authority | Create shelter |
| GET | `/api/shelters` | No | — | List shelters |
| GET | `/api/shelters/nearby` | No | — | Find nearest shelters |
| GET | `/api/shelters/:id` | No | — | Get shelter detail |
| PATCH | `/api/shelters/:id` | Yes | authority | Update shelter |
| DELETE | `/api/shelters/:id` | Yes | authority | Delete shelter |
| POST | `/api/incidents` | Yes | authority, responder | Create incident |
| GET | `/api/incidents` | Yes | All | List incidents |
| GET | `/api/incidents/:id` | Yes | All | Get incident detail |
| PATCH | `/api/incidents/:id` | Yes | authority, responder | Update incident |
| DELETE | `/api/incidents/:id` | Yes | authority | Delete incident |
| POST | `/api/resources` | Yes | authority | Create resource |
| GET | `/api/resources` | Yes | responder, authority | List resources |
| GET | `/api/resources/:id` | Yes | responder, authority | Get resource detail |
| PATCH | `/api/resources/:id` | Yes | authority | Update resource |
| DELETE | `/api/resources/:id` | Yes | authority | Delete resource |
| POST | `/api/rescue-teams` | Yes | authority | Create team |
| GET | `/api/rescue-teams` | Yes | responder, authority | List teams |
| GET | `/api/rescue-teams/:id` | Yes | responder, authority | Get team detail |
| PATCH | `/api/rescue-teams/:id` | Yes | authority | Update team |
| DELETE | `/api/rescue-teams/:id` | Yes | authority | Delete team |
| GET | `/api/notifications` | Yes | All | Get notifications |
| PATCH | `/api/notifications/:id/read` | Yes | All | Mark as read |
| PATCH | `/api/notifications/read-all` | Yes | All | Mark all as read |
| GET | `/api/dashboard/stats` | Yes | authority | Dashboard aggregates |
| GET | `/api/dashboard/recent-sos` | Yes | authority | Recent SOS feed |
| GET | `/api/dashboard/active-incidents` | Yes | authority, responder | Active incidents feed |
| GET | `/api/health` | No | — | Health check |

## File Count Summary

- **New files**: ~45 files
- **Modified files**: ~8 files
- **Total**: ~53 files

## Verification Plan

### Automated
```bash
cd backend && npx tsc --noEmit   # TypeScript compilation check
```

### Manual
- Verify `npm run dev` starts without errors
- Verify existing auth endpoints still work (no breaking changes)
- Verify health check returns 200
