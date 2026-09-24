import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  userId: mongoose.Types.ObjectId;
  sosCountdownDurationSeconds: number;
  sirenAudioEnabled: boolean;
  autoShareLocationOnSOS: boolean;
  smsAlertsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  shakeToSOSGestureEnabled: boolean;
  highContrastTheme: boolean;
  theme: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    sosCountdownDurationSeconds: { type: Number, default: 5 },
    sirenAudioEnabled: { type: Boolean, default: true },
    autoShareLocationOnSOS: { type: Boolean, default: true },
    smsAlertsEnabled: { type: Boolean, default: true },
    pushNotificationsEnabled: { type: Boolean, default: true },
    shakeToSOSGestureEnabled: { type: Boolean, default: false },
    highContrastTheme: { type: Boolean, default: false },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  { timestamps: true }
);

export const SettingsModel =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
