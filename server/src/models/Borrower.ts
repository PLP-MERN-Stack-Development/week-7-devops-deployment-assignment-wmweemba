import mongoose, { Document, Schema } from 'mongoose';

export interface IBorrower extends Document {
  name: string;
  phone: string;
  address: string;
  email?: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  totalLoans: number;
  totalOutstanding: number;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowerSchema: Schema = new Schema<IBorrower>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    joiningDate: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
    totalLoans: { type: Number, default: 0 },
    totalOutstanding: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IBorrower>('Borrower', BorrowerSchema); 