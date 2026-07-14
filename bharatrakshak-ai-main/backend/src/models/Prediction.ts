import mongoose, { Schema, Model } from 'mongoose';
import { DisasterType, RiskLevel, TrendDirection } from '../types/index.js';

export interface IPredictionDocument {
  disasterType: string;
  riskLevel: string;
  confidence: number;
  affectedStates: string[];
  affectedDistricts: string[];
  trend: string;
  forecastData: { label: string; value: number }[];
  modelUsed: string;
  dataSource: string;
  validUntil: Date;
  actions: string[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const predictionSchema = new Schema<IPredictionDocument>(
  {
    disasterType: { type: String, enum: Object.values(DisasterType), required: true },
    riskLevel: { type: String, enum: Object.values(RiskLevel), required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    affectedStates: [{ type: String, trim: true }],
    affectedDistricts: [{ type: String, trim: true }],
    trend: { type: String, enum: Object.values(TrendDirection), default: TrendDirection.STABLE },
    forecastData: [{
      label: { type: String, required: true },
      value: { type: Number, required: true },
    }],
    modelUsed: { type: String, default: 'XGBoost Flood Model' },
    dataSource: { type: String, default: 'IMD Weather Feed' },
    validUntil: { type: Date, required: true },
    actions: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

predictionSchema.index({ disasterType: 1 });
predictionSchema.index({ riskLevel: 1 });
predictionSchema.index({ createdAt: -1 });

const Prediction: Model<IPredictionDocument> = mongoose.model<IPredictionDocument>('Prediction', predictionSchema);
export default Prediction;
