import { Request, Response } from 'express';
import Loan from '../models/Loan';

// Create a new loan
export const createLoan = async (req: Request, res: Response) => {
  try {
    const loan = await Loan.create(req.body);
    res.status(201).json(loan);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create loan', details: err });
  }
};

// Get all loans
export const getLoans = async (_req: Request, res: Response) => {
  try {
    const loans = await Loan.find();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loans', details: err });
  }
};

// Get a single loan by ID
export const getLoanById = async (req: Request, res: Response) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch loan', details: err });
  }
};

// Update a loan
export const updateLoan = async (req: Request, res: Response) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json(loan);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update loan', details: err });
  }
};

// Delete a loan
export const deleteLoan = async (req: Request, res: Response) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    res.json({ message: 'Loan deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete loan', details: err });
  }
};