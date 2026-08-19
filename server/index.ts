import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './src/config/prisma';
import authRoutes from './src/routes/authRoutes';
import tripRoutes from './src/routes/tripRoutes';
import reservationRoutes from './src/routes/reservationRoutes';
import busRoutes from './src/routes/busRoutes';
import notificationRoutes from './src/routes/notificationRoutes';
import userRoutes from './src/routes/userRoutes';
import financeRoutes from './src/routes/financeRoutes';
import uploadRoutes from './src/routes/uploadRoutes';
import packageRoutes from './src/routes/packageRoutes';
import reviewRoutes from './src/routes/reviewRoutes';
import { errorHandler } from './src/middleware/errorHandler';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BTS API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/reviews', reviewRoutes);

// Global Error Handler (must be after all routes)
app.use(errorHandler);

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
