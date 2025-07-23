import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Payment from '../models/Payment';
import Loan from '../models/Loan';

// Create a new payment and update loan balances
export const createPayment = async (req: Request, res: Response) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { loanId, borrowerId, amount, paymentDate, method, note } = req.body;
    const payment = await Payment.create({ loanId, borrowerId, amount, paymentDate, method, note });

    // Update the loan's paidAmount and outstandingAmount
    const loan = await Loan.findById(loanId);
    if (loan) {
      loan.paidAmount += amount;
      loan.outstandingAmount -= amount;
      if (loan.outstandingAmount <= 0) {
        loan.status = 'completed';
        loan.outstandingAmount = 0;
      }
      await loan.save();
    }

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create payment', details: err });
  }
};

// Get all payments
export const getPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments', details: err });
  }
};

// Get a payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment', details: err });
  }
};

// Update a payment
export const updatePayment = async (req: Request, res: Response) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update payment', details: err });
  }
};

// Delete a payment
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete payment', details: err });
  }
};