import mongoose, { Schema, Model } from 'mongoose';
import { IncidentType, IncidentSeverity, IncidentStatus } from '../types/index.js';

export interface IIncidentDocument {
  type: string;
  severity: string;
  location: { type: string; coordinates: number[] };
  address?: string;
  status: string;
  affectedArea: string;
  description: string;
  reportedBy: mongoose.Types.ObjectId;
  assignedTeams: mongoose.Types.ObjectId[];
  casualties: number;
  injured: number;
  evacuated: number;
  createdAt: Date;
  updatedAt: Date;
}

const incidentSchema = new Schema<IIncidentDocument>(
  {
    type: { type: String, enum: Object.values(IncidentType), required: true },
    severity: { type: String, enum: Object.values(IncidentSeverity), required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, trim: true },
    status: { type: String, enum: Object.values(IncidentStatus), default: IncidentStatus.REPORTED },
    affectedArea: { type: String, required: [true, 'Affected area is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], maxlength: 3000 },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTeams: [{ type: Schema.Types.ObjectId, ref: 'RescueTeam' }],
    casualties: { type: Number, default: 0, min: 0 },
    injured: { type: Number, default: 0, min: 0 },
    evacuated: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

incidentSchema.index({ type: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ createdAt: -1 });

const Incident: Model<IIncidentDocument> = mongoose.model<IIncidentDocument>('Incident', incidentSchema);
export default Incident;
