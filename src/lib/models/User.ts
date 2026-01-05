import mongoose from 'mongoose';

export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl?: string;
  role: string;
  accountStatus: string;
  memberSince: Date;
  lastLogin: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String },
  role: { type: String, default: 'Administrator' },
  accountStatus: { type: String, default: 'Active' },
  memberSince: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);