# BharatRakshak AI — Backend API Documentation

> **Predict. Alert. Rescue.**

Base URL: `http://localhost:5000/api`

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Roles
| Role | Login Endpoint | Credentials |
|------|---------------|-------------|
| `citizen` | `POST /auth/citizen-login` | `mobileNumber` (10 digits) |
| `responder` | `POST /auth/responder-login` | `employeeId` + `password` |
| `authority` | `POST /auth/authority-login` | `officerId` + `password` + `securityPin` |

---

## Endpoints

### 🔐 Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/citizen-login` | ❌ | Citizen login/auto-register |
| POST | `/responder-login` | ❌ | Responder login |
| POST | `/authority-login` | ❌ | Authority login |
| POST | `/register` | ❌ | Register new user |
| GET | `/me` | ✅ | Get current user profile |
| POST | `/logout` | ✅ | Logout |

---

### 🆘 SOS (`/api/sos`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | ✅ | Citizen | Create SOS request |
| GET | `/` | ✅ | All (role-filtered) | List SOS requests |
| GET | `/my` | ✅ | Citizen | Get own SOS requests |
| GET | `/:id` | ✅ | All | Get SOS by ID |
| PATCH | `/:id` | ✅ | Responder, Authority | Update SOS |
| DELETE | `/:id` | ✅ | Authority | Delete SOS |
| PATCH | `/:id/assign` | ✅ | Authority | Assign responder |

**Query params:** `status`, `priority`, `emergencyType`, `page`, `limit`

---

### ⚠️ Alerts (`/api/alerts`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | ✅ | Authority | Create alert |
| GET | `/` | ✅ | All | List alerts |
| GET | `/:id` | ✅ | All | Get alert by ID |
| PATCH | `/:id` | ✅ | Authority | Update alert |
| DELETE | `/:id` | ✅ | Authority | Delete alert |

**Query params:** `severity`, `type`, `active`, `page`, `limit`

---

### 🏕️ Shelters (`/api/shelters`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | ❌ | Public | List shelters |
| GET | `/nearby?lng=&lat=&radius=` | ❌ | Public | Find nearby shelters |
| GET | `/:id` | ❌ | Public | Get shelter by ID |
| POST | `/` | ✅ | Authority | Create shelter |
| PATCH | `/:id` | ✅ | Authority | Update shelter |
| DELETE | `/:id` | ✅ | Authority | Delete shelter |

---

### 🔥 Incidents (`/api/incidents`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | ✅ | Responder, Authority | Report incident |
| GET | `/` | ✅ | All | List incidents |
| GET | `/:id` | ✅ | All | Get incident by ID |
| PATCH | `/:id` | ✅ | Responder, Authority | Update incident |
| DELETE | `/:id` | ✅ | Authority | Delete incident |

**Query params:** `type`, `severity`, `status`, `page`, `limit`

---

### 🚑 Resources (`/api/resources`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | ✅ | Authority | Create resource |
| GET | `/` | ✅ | Responder, Authority | List resources |
| GET | `/:id` | ✅ | Responder, Authority | Get resource by ID |
| PATCH | `/:id` | ✅ | Authority | Update resource |
| DELETE | `/:id` | ✅ | Authority | Delete resource |

---

### 🛟 Rescue Teams (`/api/rescue-teams`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | ✅ | Authority | Create team |
| GET | `/` | ✅ | Responder, Authority | List teams |
| GET | `/:id` | ✅ | Responder, Authority | Get team by ID |
| PATCH | `/:id` | ✅ | Authority | Update team |
| DELETE | `/:id` | ✅ | Authority | Delete team |

---

### 🔮 Predictions (`/api/predictions`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | ✅ | All | List predictions |
| POST | `/` | ✅ | Authority | Create prediction |
| GET | `/:state` | ✅ | All | Get predictions by state |

---

### 📸 Damage Reports (`/api/damage-reports`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/upload` | ✅ | Citizen, Responder | Upload damage report (multipart) |
| GET | `/` | ✅ | All | List damage reports |
| GET | `/:id` | ✅ | All | Get report by ID |

**File upload:** `images` field, max 5 files, max 10MB each

---

### 📊 Dashboard (`/api/dashboard`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/stats` | ✅ | Authority | Full platform statistics |
| GET | `/responder` | ✅ | Responder | Responder dashboard |
| GET | `/citizen` | ✅ | Citizen | Citizen dashboard |

---

### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | ✅ | All | Get my notifications |
| GET | `/unread-count` | ✅ | All | Get unread count |
| PATCH | `/:id/read` | ✅ | All | Mark as read |
| PATCH | `/read-all` | ✅ | All | Mark all as read |
| DELETE | `/:id` | ✅ | All | Delete notification |

---

### 🤖 AI Services (`/api/ai`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/predict/flood` | ✅ | XGBoost flood risk prediction |
| POST | `/detect/damage` | ✅ | YOLOv8 damage detection |
| POST | `/classify/sos-priority` | ✅ | SOS priority classification |

> **Note:** AI endpoints use FastAPI integration when available, falling back to intelligent deterministic stubs.

---

### 💚 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Server status |

---

## Response Format

All responses follow this format:
```json
{
  "success": true,
  "message": "Description",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "stack trace (dev only)"
}
```

## Environment Variables

See `.env.example` for all required configuration.

---

## Frontend Route ↔ Backend API Mapping

| Frontend Route | Backend APIs Used |
|---|---|
| `/` | `GET /health` |
| `/role-select` | — (client only) |
| `/login` | `POST /auth/citizen-login`, `/responder-login`, `/authority-login` |
| `/dashboard` | `GET /dashboard/stats`, `/responder`, `/citizen` |
| `/portal/citizen` | `GET /dashboard/citizen`, `GET /sos/my`, `GET /alerts` |
| `/portal/responder` | `GET /dashboard/responder`, `PATCH /sos/:id` |
| `/portal/admin` | `GET /dashboard/stats`, all CRUD endpoints |
| `/predict` | `GET /predictions`, `POST /ai/predict/flood` |
| `/sos` | `POST /sos`, `POST /ai/classify/sos-priority` |
| `/damage-report` | `POST /damage-reports/upload`, `POST /ai/detect/damage` |
