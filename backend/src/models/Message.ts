import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  booking: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderName: string;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
