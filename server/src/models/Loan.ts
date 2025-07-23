import mongoose, { Document, Schema } from 'mongoose';

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;
  borrowerName: string;
  principal: number;
  interestRate: number;
  interestType: 'simple' | 'annual';
  duration: { value: number; unit: 'weeks' | 'months' };
  startDate: string;
  dueDate: string;
  status: 'active' | 'completed' | 'overdue' | 'defaulted';
  emi: number;
  totalInterest: number;
  totalAmount: number;
  outstandingAmount: number;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema: Schema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: 'Borrower', required: true },
    borrowerName: { type: String, required: true },
    principal: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    interestType: { type: String, enum: ['simple', 'annual'], required: true },
    duration: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['weeks', 'months'], required: true },
    },
    startDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed', 'overdue', 'defaulted'], required: true },
    emi: { type: Number, required: true },
    totalInterest: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    outstandingAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILoan>('Loan', LoanSchema); 