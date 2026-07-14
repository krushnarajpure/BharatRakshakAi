// ─── User Roles ───────────────────────────────────────────────────────────────

export enum UserRole {
  CITIZEN = 'citizen',
  RESPONDER = 'responder',
  AUTHORITY = 'authority',
}

// ─── SOS ──────────────────────────────────────────────────────────────────────

export enum SOSPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
}

export enum SOSStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// ─── Emergency Types ──────────────────────────────────────────────────────────

export enum EmergencyType {
  FIRE = 'fire',
  FLOOD = 'flood',
  EARTHQUAKE = 'earthquake',
  ACCIDENT = 'accident',
  MEDICAL = 'medical',
  CRIME = 'crime',
  GAS_LEAK = 'gas',
  COLLAPSE = 'collapse',
  CYCLONE = 'cyclone',
  RIOT = 'riot',
  LANDSLIDE = 'landslide',
  OTHER = 'other',
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
}

export enum AlertType {
  CYCLONE = 'cyclone',
  FLOOD = 'flood',
  EARTHQUAKE = 'earthquake',
  TSUNAMI = 'tsunami',
  HEATWAVE = 'heatwave',
  COLDWAVE = 'coldwave',
  LANDSLIDE = 'landslide',
  STORM = 'storm',
  FIRE = 'fire',
  INDUSTRIAL = 'industrial',
  OTHER = 'other',
}

// ─── Incidents ────────────────────────────────────────────────────────────────

export enum IncidentType {
  FLOOD = 'flood',
  EARTHQUAKE = 'earthquake',
  CYCLONE = 'cyclone',
  LANDSLIDE = 'landslide',
  FIRE = 'fire',
  INDUSTRIAL_ACCIDENT = 'industrial_accident',
  BUILDING_COLLAPSE = 'building_collapse',
  CHEMICAL_SPILL = 'chemical_spill',
  TSUNAMI = 'tsunami',
  HEATWAVE = 'heatwave',
  STORM = 'storm',
  OTHER = 'other',
}

export enum IncidentSeverity {
  CATASTROPHIC = 'catastrophic',
  SEVERE = 'severe',
  MODERATE = 'moderate',
  MINOR = 'minor',
}

export enum IncidentStatus {
  REPORTED = 'reported',
  CONFIRMED = 'confirmed',
  RESPONDING = 'responding',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// ─── Resources ────────────────────────────────────────────────────────────────

export enum ResourceType {
  AMBULANCE = 'ambulance',
  FIRE_TRUCK = 'fire_truck',
  MEDICAL_TEAM = 'medical_team',
  RESCUE_BOAT = 'rescue_boat',
  HELICOPTER = 'helicopter',
  NDRF_TEAM = 'ndrf_team',
  POLICE_UNIT = 'police_unit',
  RELIEF_TRUCK = 'relief_truck',
}

export enum ResourceStatus {
  AVAILABLE = 'available',
  DEPLOYED = 'deployed',
  EN_ROUTE = 'en_route',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
}

// ─── Shelters ─────────────────────────────────────────────────────────────────

export enum ShelterStatus {
  OPEN = 'open',
  FULL = 'full',
  CLOSED = 'closed',
  UNDER_PREPARATION = 'under_preparation',
}

// ─── Rescue Teams ─────────────────────────────────────────────────────────────

export enum TeamStatus {
  STANDBY = 'standby',
  DEPLOYED = 'deployed',
  RETURNING = 'returning',
  OFF_DUTY = 'off_duty',
}

export enum MissionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
}

// ─── Predictions ──────────────────────────────────────────────────────────────

export enum DisasterType {
  FLOOD = 'flood',
  CYCLONE = 'cyclone',
  EARTHQUAKE = 'earthquake',
  HEATWAVE = 'heatwave',
  LANDSLIDE = 'landslide',
  TSUNAMI = 'tsunami',
  STORM = 'storm',
  DROUGHT = 'drought',
}

export enum RiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
}

export enum TrendDirection {
  INCREASING = 'increasing',
  STABLE = 'stable',
  DECREASING = 'decreasing',
}

// ─── Damage Reports ───────────────────────────────────────────────────────────

export enum DamageType {
  STRUCTURAL = 'structural',
  INFRASTRUCTURE = 'infrastructure',
  AGRICULTURAL = 'agricultural',
  ENVIRONMENTAL = 'environmental',
  VEHICLE = 'vehicle',
  UTILITY = 'utility',
  OTHER = 'other',
}

export enum DamageReportStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  ASSESSED = 'assessed',
  CLOSED = 'closed',
}

// ─── Notifications ────────────────────────────────────────────────────────────

export enum NotificationType {
  SOS_CREATED = 'sos_created',
  SOS_ASSIGNED = 'sos_assigned',
  SOS_UPDATED = 'sos_updated',
  ALERT_ISSUED = 'alert_issued',
  INCIDENT_REPORTED = 'incident_reported',
  TEAM_DEPLOYED = 'team_deployed',
  RESOURCE_ASSIGNED = 'resource_assigned',
  PREDICTION_WARNING = 'prediction_warning',
  SYSTEM = 'system',
}
