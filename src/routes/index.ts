import { Router } from 'express'
import healthRoutes from './healthRoutes.js'
import authRoutes from './authRoutes.js'
import friendRoutes from './friendRoutes.js'
import taskRoutes from './taskRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'

const router = Router()

// Health check route (public)
router.use('/health', healthRoutes)

// Auth routes
router.use('/auth', authRoutes)

// Friend routes (protected)
router.use('/friends', friendRoutes)

// Task routes (protected)
router.use('/tasks', taskRoutes)

// Dashboard routes (protected)
router.use('/dashboard', dashboardRoutes)

export default router
