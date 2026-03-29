import mongoose, { Document, Schema } from 'mongoose';

export interface IProvider extends Document {
  user: mongoose.Types.ObjectId;
  category: string;
  bio: string;
  skills: string[];
  state: string;
  city: string;
  address: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  yearsOfExperience: number;
}

const ProviderSchema = new Schema<IProvider>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  state: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, default: '' },
  hourlyRate: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  yearsOfExperience: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IProvider>('Provider', ProviderSchema);
