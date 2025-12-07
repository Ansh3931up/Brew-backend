import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// Health check route (public)
router.use('/health', healthRoutes);

// API routes
router.use('/users', userRoutes);

export default router;
