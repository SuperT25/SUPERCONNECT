import mongoose, { Document, Schema } from 'mongoose';

export interface IVTUTransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  serviceID: string;
  amount: number;
  phone: string;
  status: string;
  reference: string;
  details: string;
  createdAt: Date;
}

const VTUTransactionSchema = new Schema<IVTUTransaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  serviceID: { type: String, default: '' },
  amount: { type: Number, required: true },
  phone: { type: String, default: '' },
  status: { type: String, default: 'success' },
  reference: { type: String, default: '' },
  details: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IVTUTransaction>('VTUTransaction', VTUTransactionSchema);
