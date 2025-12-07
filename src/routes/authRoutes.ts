import { Router } from 'express'
import { register, login, getCurrentUser, logout } from '../controllers/authController.js'
import {
  googleAuth,
  googleCallback,
  googleAuthInitiate,
  googleAuthStatus
} from '../controllers/googleAuthController.js'
import { registerValidation, loginValidation } from '../middleware/authValidation.js'
import { authenticate } from '../middleware/auth.js'
import { authRateLimitMiddleware } from '../middleware/security.js'
import env from '../config/env.js'

const router = Router()

// Public routes with rate limiting (only on signup/login)
router.post('/register', authRateLimitMiddleware, registerValidation, register)
router.post('/login', authRateLimitMiddleware, loginValidation, login)

// Google OAuth status endpoint (public)
router.get('/google/status', googleAuthStatus)

// Google OAuth routes
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', googleAuth)
  router.get('/google/callback', googleCallback)
} else {
  router.get('/google', googleAuthInitiate)
  router.get('/google/callback', googleAuthInitiate)
}

// Protected routes
router.get('/me', authenticate, getCurrentUser)
router.post('/logout', authenticate, logout)

export default router
