import mongoose, { Schema, Model } from 'mongoose';
import { ShelterStatus } from '../types/index.js';

export interface IShelterDocument {
  name: string;
  location: { type: string; coordinates: number[] };
  address?: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  amenities: string[];
  contactNumber?: string;
  managedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const shelterSchema = new Schema<IShelterDocument>(
  {
    name: { type: String, required: [true, 'Shelter name is required'], trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, trim: true },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: 1 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(ShelterStatus), default: ShelterStatus.OPEN },
    amenities: [{ type: String, trim: true }],
    contactNumber: { type: String, trim: true },
    managedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

shelterSchema.index({ location: '2dsphere' });
shelterSchema.index({ status: 1 });

const Shelter: Model<IShelterDocument> = mongoose.model<IShelterDocument>('Shelter', shelterSchema);
export default Shelter;
