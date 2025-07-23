import express from 'express';
import { body } from 'express-validator';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController';

const router = express.Router();

router.use(authenticateJWT); // Protect all payment routes

// Validation rules for creating a payment
const paymentValidation = [
  body('loanId').notEmpty().withMessage('loanId is required'),
  body('borrowerId').notEmpty().withMessage('borrowerId is required'),
  body('amount').isNumeric().withMessage('amount must be a number'),
  body('paymentDate').notEmpty().withMessage('paymentDate is required'),
];

// Apply validation to POST and PUT
router.post('/', paymentValidation, createPayment);
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.put('/:id', paymentValidation, updatePayment);
router.delete('/:id', deletePayment);

export default router;