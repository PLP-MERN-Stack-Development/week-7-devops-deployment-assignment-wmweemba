import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
  createBorrower,
  getAllBorrowers, // <-- Use the correct export name
  getBorrowerById,
  updateBorrower,
  deleteBorrower,
} from '../controllers/borrowerController';

const router = express.Router();

router.use(authenticateJWT); // Protect all borrower routes

router.post('/', createBorrower);
router.get('/', getAllBorrowers); // <-- Use the correct handler here
router.get('/:id', getBorrowerById);
router.put('/:id', updateBorrower);
router.delete('/:id', deleteBorrower);

export default router;