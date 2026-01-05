import mongoose from 'mongoose';

export interface ISettings {
  _id?: string;
  theme: string;
  sidebarCollapsed: boolean;
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  orderUpdates: boolean;
  companyName: string;
  timezone: string;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const settingsSchema = new mongoose.Schema({
  theme: { type: String, default: 'system' },
  sidebarCollapsed: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  lowStockAlerts: { type: Boolean, default: true },
  orderUpdates: { type: Boolean, default: true },
  companyName: { type: String, default: 'ERP-Lite Corp' },
  timezone: { type: String, default: 'utc+5:30' },
  currency: { type: String, default: 'inr' },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);