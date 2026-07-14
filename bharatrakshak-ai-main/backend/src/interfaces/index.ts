import { Document, Types } from 'mongoose';
import {
  UserRole, SOSPriority, SOSStatus, EmergencyType,
  AlertSeverity, AlertType, IncidentType, IncidentSeverity, IncidentStatus,
  ResourceType, ResourceStatus, ShelterStatus, TeamStatus, MissionStatus,
  DisasterType, RiskLevel, TrendDirection, DamageType, DamageReportStatus,
  NotificationType,
} from '../types';

// ─── GeoJSON Point ────────────────────────────────────────────────────────────

export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  role: UserRole;
  name?: string;
  email?: string;
  phone?: string;
  mobileNumber?: string;
  employeeId?: string;
  officerId?: string;
  password?: string;
  teamCode?: string;
  securityPin?: string;
  profileImage?: string;
  location?: IGeoPoint;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── SOS ──────────────────────────────────────────────────────────────────────

export interface ISOSContact {
  name: string;
  phone: string;
  relation: string;
}

export interface IAIAssessment {
  riskLevel: string;
  riskScore: number;
  predictedResponseTime: string;
  unitType: string;
  nearestUnit: string;
  distance: string;
  warnings: string[];
  actions: string[];
}

export interface ISOS extends Document {
  userId: Types.ObjectId;
  location: IGeoPoint;
  address?: string;
  emergencyType: EmergencyType;
  severity: SOSPriority;
  priority: SOSPriority;
  status: SOSStatus;
  description: string;
  images: string[];
  videos: string[];
  contacts: ISOSContact[];
  assignedResponder?: Types.ObjectId;
  aiAssessment?: IAIAssessment;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Prediction ───────────────────────────────────────────────────────────────

export interface IForecastDataPoint {
  label: string;
  value: number;
}

export interface IPrediction extends Document {
  disasterType: DisasterType;
  riskLevel: RiskLevel;
  confidence: number;
  affectedStates: string[];
  affectedDistricts: string[];
  trend: TrendDirection;
  forecastData: IForecastDataPoint[];
  modelUsed: string;
  dataSource: string;
  validUntil: Date;
  actions: string[];
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Damage Report ────────────────────────────────────────────────────────────

export interface IAIAnalysis {
  detected: boolean;
  damagePercentage?: number;
  classifications: string[];
  confidence: number;
  processedAt?: Date;
}

export interface IDamageReport extends Document {
  reportedBy: Types.ObjectId;
  location: IGeoPoint;
  address?: string;
  images: string[];
  damageType: DamageType;
  severity: string;
  description: string;
  aiAnalysis?: IAIAnalysis;
  estimatedCost?: number;
  status: DamageReportStatus;
  verifiedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export interface IAlert extends Document {
  title: string;
  message: string;
  severity: AlertSeverity;
  type: AlertType;
  affectedAreas: string[];
  isActive: boolean;
  createdBy: Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Shelter ──────────────────────────────────────────────────────────────────

export interface IShelter extends Document {
  name: string;
  location: IGeoPoint;
  address?: string;
  capacity: number;
  currentOccupancy: number;
  status: ShelterStatus;
  amenities: string[];
  contactNumber?: string;
  managedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Incident ─────────────────────────────────────────────────────────────────

export interface IIncident extends Document {
  type: IncidentType;
  severity: IncidentSeverity;
  location: IGeoPoint;
  address?: string;
  status: IncidentStatus;
  affectedArea: string;
  description: string;
  reportedBy: Types.ObjectId;
  assignedTeams: Types.ObjectId[];
  casualties: number;
  injured: number;
  evacuated: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Resource ─────────────────────────────────────────────────────────────────

export interface IResource extends Document {
  type: ResourceType;
  name: string;
  registrationNumber?: string;
  status: ResourceStatus;
  location: IGeoPoint;
  assignedTo?: Types.ObjectId;
  capacity: number;
  personnel: number;
  district?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Rescue Team ──────────────────────────────────────────────────────────────

export interface ITeamMember {
  userId?: Types.ObjectId;
  name: string;
  role: string;
  contact: string;
}

export interface IRescueTeam extends Document {
  name: string;
  type: string;
  members: ITeamMember[];
  leader: Types.ObjectId;
  status: TeamStatus;
  currentMission?: string;
  missionStatus: MissionStatus;
  location: IGeoPoint;
  equipment: string[];
  district?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
