import mongoose, { Schema, Model } from 'mongoose';
import { AlertSeverity, AlertType } from '../types/index.js';

export interface IAlertDocument {
  title: string;
  message: string;
  severity: string;
  type: string;
  affectedAreas: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlertDocument>(
  {
    title: { type: String, required: [true, 'Alert title is required'], trim: true, maxlength: 200 },
    message: { type: String, required: [true, 'Alert message is required'], maxlength: 2000 },
    severity: { type: String, enum: Object.values(AlertSeverity), required: true },
    type: { type: String, enum: Object.values(AlertType), required: true },
    affectedAreas: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

alertSchema.index({ severity: 1 });
alertSchema.index({ isActive: 1 });
alertSchema.index({ createdAt: -1 });

const Alert: Model<IAlertDocument> = mongoose.model<IAlertDocument>('Alert', alertSchema);
export default Alert;
