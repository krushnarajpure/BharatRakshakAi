import mongoose, { Schema, Model } from 'mongoose';
import { SOSPriority, SOSStatus, EmergencyType } from '../types/index.js';

export interface ISOSDocument {
  userId: mongoose.Types.ObjectId;
  location: { type: string; coordinates: number[] };
  address?: string;
  emergencyType: string;
  severity: string;
  priority: string;
  status: string;
  description: string;
  images: string[];
  videos: string[];
  contacts: { name: string; phone: string; relation: string }[];
  assignedResponder?: mongoose.Types.ObjectId;
  aiAssessment?: {
    riskLevel: string;
    riskScore: number;
    predictedResponseTime: string;
    unitType: string;
    nearestUnit: string;
    distance: string;
    warnings: string[];
    actions: string[];
  };
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sosSchema = new Schema<ISOSDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, trim: true },
    emergencyType: {
      type: String,
      enum: Object.values(EmergencyType),
      required: [true, 'Emergency type is required'],
    },
    severity: {
      type: String,
      enum: Object.values(SOSPriority),
      required: [true, 'Severity is required'],
    },
    priority: {
      type: String,
      enum: Object.values(SOSPriority),
      default: SOSPriority.MODERATE,
    },
    status: {
      type: String,
      enum: Object.values(SOSStatus),
      default: SOSStatus.PENDING,
    },
    description: { type: String, required: [true, 'Description is required'], maxlength: 2000 },
    images: [{ type: String }],
    videos: [{ type: String }],
    contacts: [{
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relation: { type: String },
    }],
    assignedResponder: { type: Schema.Types.ObjectId, ref: 'User' },
    aiAssessment: {
      riskLevel: String,
      riskScore: Number,
      predictedResponseTime: String,
      unitType: String,
      nearestUnit: String,
      distance: String,
      warnings: [String],
      actions: [String],
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

sosSchema.index({ status: 1 });
sosSchema.index({ priority: 1 });
sosSchema.index({ userId: 1 });
sosSchema.index({ assignedResponder: 1 });
sosSchema.index({ location: '2dsphere' });
sosSchema.index({ createdAt: -1 });

const SOS: Model<ISOSDocument> = mongoose.model<ISOSDocument>('SOS', sosSchema);
export default SOS;
