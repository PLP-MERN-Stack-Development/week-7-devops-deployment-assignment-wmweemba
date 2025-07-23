import express from 'express';
import cors from 'cors';
import borrowerRoutes from './routes/borrowerRoutes';
import loanRoutes from './routes/loanRoutes';
import authRoutes from './routes/authRoutes';
import paymentRoutes from './routes/paymentRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

export default app;
