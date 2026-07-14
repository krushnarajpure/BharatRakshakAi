import mongoose, { Schema, Model } from 'mongoose';
import { DamageType, DamageReportStatus } from '../types/index.js';

export interface IDamageReportDocument {
  reportedBy: mongoose.Types.ObjectId;
  location: { type: string; coordinates: number[] };
  address?: string;
  images: string[];
  damageType: string;
  severity: string;
  description: string;
  aiAnalysis?: {
    detected: boolean;
    damagePercentage?: number;
    classifications: string[];
    confidence: number;
    processedAt?: Date;
  };
  estimatedCost?: number;
  status: string;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const damageReportSchema = new Schema<IDamageReportDocument>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, trim: true },
    images: [{ type: String }],
    damageType: { type: String, enum: Object.values(DamageType), required: true },
    severity: { type: String, enum: ['critical', 'high', 'moderate', 'low'], required: true },
    description: { type: String, required: [true, 'Description is required'], maxlength: 3000 },
    aiAnalysis: {
      detected: Boolean,
      damagePercentage: Number,
      classifications: [String],
      confidence: Number,
      processedAt: Date,
    },
    estimatedCost: { type: Number, min: 0 },
    status: { type: String, enum: Object.values(DamageReportStatus), default: DamageReportStatus.SUBMITTED },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

damageReportSchema.index({ status: 1 });
damageReportSchema.index({ damageType: 1 });
damageReportSchema.index({ location: '2dsphere' });
damageReportSchema.index({ createdAt: -1 });

const DamageReport: Model<IDamageReportDocument> = mongoose.model<IDamageReportDocument>('DamageReport', damageReportSchema);
export default DamageReport;
