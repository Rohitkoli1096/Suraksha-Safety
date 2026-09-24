import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  notifyOnSOS: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'RESPONDER';
  avatarUrl?: string;
  bloodGroup?: string;
  address?: string;
  medicalConditions?: string;
  emergencyContacts: IEmergencyContact[];
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
  notifyOnSOS: { type: Boolean, default: true },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['USER', 'ADMIN', 'RESPONDER'], default: 'USER' },
    avatarUrl: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    address: { type: String, default: '' },
    medicalConditions: { type: String, default: '' },
    emergencyContacts: [EmergencyContactSchema],
    refreshToken: { type: String, default: '' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
