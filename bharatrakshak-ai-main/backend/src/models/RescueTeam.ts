import mongoose, { Schema, Model } from 'mongoose';
import { TeamStatus, MissionStatus } from '../types/index.js';

export interface IRescueTeamDocument {
  name: string;
  type: string;
  members: { userId?: mongoose.Types.ObjectId; name: string; role: string; contact: string }[];
  leader: mongoose.Types.ObjectId;
  status: string;
  currentMission?: string;
  missionStatus: string;
  location: { type: string; coordinates: number[] };
  equipment: string[];
  district?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rescueTeamSchema = new Schema<IRescueTeamDocument>(
  {
    name: { type: String, required: [true, 'Team name is required'], trim: true },
    type: { type: String, required: [true, 'Team type is required'], trim: true },
    members: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      role: { type: String, required: true },
      contact: { type: String, required: true },
    }],
    leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(TeamStatus), default: TeamStatus.STANDBY },
    currentMission: { type: String },
    missionStatus: { type: String, enum: Object.values(MissionStatus), default: MissionStatus.NOT_STARTED },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    equipment: [{ type: String, trim: true }],
    district: { type: String, trim: true },
    state: { type: String, trim: true },
  },
  { timestamps: true }
);

rescueTeamSchema.index({ status: 1 });
rescueTeamSchema.index({ location: '2dsphere' });

const RescueTeam: Model<IRescueTeamDocument> = mongoose.model<IRescueTeamDocument>('RescueTeam', rescueTeamSchema);
export default RescueTeam;
