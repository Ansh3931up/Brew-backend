import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import xss from 'xss-clean'
import env from '../config/env.js'

// CORS configuration
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    const allowedOrigins = env.CORS_ORIGIN.split(',')
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // This is crucial for cookies to work
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Authorization', 'Set-Cookie'],
  optionsSuccessStatus: 200
})

// Rate limiting for auth routes only (signup/login)
export const authRateLimitMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS || 5, // 5 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Only apply to signup and login routes
    return !req.path.includes('/register') && !req.path.includes('/login')
  }
})

// Helmet security headers
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  crossOriginEmbedderPolicy: false,
  // Allow cookies to work properly
  crossOriginResourcePolicy: { policy: 'cross-origin' }
})

// Data sanitization against NoSQL injection
export const mongoSanitizeMiddleware = mongoSanitize()

// Prevent parameter pollution
export const hppMiddleware = hpp()

// XSS protection
export const xssMiddleware = xss()
