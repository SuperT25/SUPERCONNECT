import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'provider';
  state: string;
  city: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
