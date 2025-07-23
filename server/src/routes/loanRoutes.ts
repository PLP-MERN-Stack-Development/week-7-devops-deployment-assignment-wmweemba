import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
} from '../controllers/loanController';

const router = express.Router();

router.use(authenticateJWT); // Protect all loan routes

router.post('/', createLoan);
router.get('/', getLoans);
router.get('/:id', getLoanById);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

export default router;