import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  loanId: mongoose.Types.ObjectId;
  borrowerId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: string;
  method?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    borrowerId: { type: Schema.Types.ObjectId, ref: 'Borrower', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: String, required: true },
    method: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);