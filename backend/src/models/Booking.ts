import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  customer: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  service: string;
  description: string;
  scheduledDate: Date;
  address: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number;
  rating?: number;
  review?: string;
  paymentReference?: string;
}

const BookingSchema = new Schema<IBooking>({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
  service: { type: String, required: true },
  description: { type: String, default: '' },
  scheduledDate: { type: Date, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  totalAmount: { type: Number, default: 0 },
  rating: { type: Number },
  review: { type: String },
  paymentReference: { type: String },
}, { timestamps: true });

export default mongoose.model<IBooking>('Booking', BookingSchema);
