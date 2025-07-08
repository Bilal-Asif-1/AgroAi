import mongoose, { Document } from 'mongoose';

export interface IFarm extends Document {
  name: string;
  area: string;
  city: string;
  user: mongoose.Schema.Types.ObjectId;
  pesticides?: string;
  waterStatus?: string;
}

const farmSchema = new mongoose.Schema<IFarm>({
  name: { type: String, required: true, trim: true },
  area: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pesticides: { type: String, trim: true },
  waterStatus: { type: String, trim: true }
}, {
  timestamps: true
});

export const Farm = mongoose.model<IFarm>('Farm', farmSchema); 