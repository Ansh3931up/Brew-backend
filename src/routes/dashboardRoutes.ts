import { Router } from 'express'
import { getDashboardStats } from '../controllers/dashboardController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get dashboard statistics
router.get('/stats', getDashboardStats)

export default router
