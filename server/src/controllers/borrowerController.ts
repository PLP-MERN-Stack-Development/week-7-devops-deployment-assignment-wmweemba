import { Request, Response } from 'express';
import Borrower from '../models/Borrower';

// Create a new borrower
export const createBorrower = async (req: Request, res: Response) => {
  try {
    const borrower = await Borrower.create(req.body);
    res.status(201).json(borrower);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get all borrowers
export const getAllBorrowers = async (_req: Request, res: Response) => {
  try {
    const borrowers = await Borrower.find();
    res.json(borrowers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get a single borrower by ID
export const getBorrowerById = async (req: Request, res: Response) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ error: 'Borrower not found' });
    res.json(borrower);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a borrower by ID
export const updateBorrower = async (req: Request, res: Response) => {
  try {
    const borrower = await Borrower.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!borrower) return res.status(404).json({ error: 'Borrower not found' });
    res.json(borrower);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Delete a borrower by ID
export const deleteBorrower = async (req: Request, res: Response) => {
  try {
    const borrower = await Borrower.findByIdAndDelete(req.params.id);
    if (!borrower) return res.status(404).json({ error: 'Borrower not found' });
    res.json({ message: 'Borrower deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}; 