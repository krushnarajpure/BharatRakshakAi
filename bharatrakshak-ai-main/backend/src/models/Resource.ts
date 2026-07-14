import mongoose, { Schema, Model } from 'mongoose';
import { ResourceType, ResourceStatus } from '../types/index.js';

export interface IResourceDocument {
  type: string;
  name: string;
  registrationNumber?: string;
  status: string;
  location: { type: string; coordinates: number[] };
  assignedTo?: mongoose.Types.ObjectId;
  capacity: number;
  personnel: number;
  district?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResourceDocument>(
  {
    type: { type: String, enum: Object.values(ResourceType), required: true },
    name: { type: String, required: [true, 'Resource name is required'], trim: true },
    registrationNumber: { type: String, trim: true, sparse: true },
    status: { type: String, enum: Object.values(ResourceStatus), default: ResourceStatus.AVAILABLE },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Incident' },
    capacity: { type: Number, default: 1, min: 1 },
    personnel: { type: Number, default: 0, min: 0 },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
  },
  { timestamps: true }
);

resourceSchema.index({ type: 1 });
resourceSchema.index({ status: 1 });
resourceSchema.index({ location: '2dsphere' });

const Resource: Model<IResourceDocument> = mongoose.model<IResourceDocument>('Resource', resourceSchema);
export default Resource;
