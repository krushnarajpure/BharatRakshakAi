import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/index.js';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUserDocument {
  role: string;
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
  location?: {
    type: string;
    coordinates: number[];
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUserDocument>(
  {
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'User role is required'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    officerId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    teamCode: {
      type: String,
      trim: true,
    },
    securityPin: {
      type: String,
      select: false,
    },
    profileImage: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' });

// ─── Pre-save: Hash password ──────────────────────────────────────────────────

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance method: Compare password ────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Sanitize output ─────────────────────────────────────────────────────────

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.securityPin;
  return obj;
};

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
export default User;