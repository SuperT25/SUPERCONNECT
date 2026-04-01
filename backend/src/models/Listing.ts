import mongoose, { Schema } from 'mongoose';

interface IListing {
  seller: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'phone' | 'computer';
  type: 'sell' | 'repair';
  price: number;
  condition: 'new' | 'used' | 'refurbished';
  brand: string;
  model: string;
  state: string;
  city: string;
  images: string[];
  isAvailable: boolean;
  views: number;
}

const ListingSchema = new Schema<IListing>({
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['phone', 'computer'], required: true },
  type: { type: String, enum: ['sell', 'repair'], required: true },
  price: { type: Number, default: 0 },
  condition: { type: String, enum: ['new', 'used', 'refurbished'], default: 'used' },
  brand: { type: String, default: '' },
  model: { type: String, default: '' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  images: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Listing', ListingSchema);
