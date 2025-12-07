import express, { Express } from 'express'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import env from './config/env.js'
import './config/passport.js'
import {
  corsMiddleware,
  helmetMiddleware,
  mongoSanitizeMiddleware,
  hppMiddleware,
  xssMiddleware
} from './middleware/security.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFound.js'
import routes from './routes/index.js'

const createApp = (): Express => {
  const app: Express = express()

  // Trust proxy (important for rate limiting behind reverse proxy)
  app.set('trust proxy', 1)

  // Security middleware (order matters!)
  app.use(helmetMiddleware)
  app.use(corsMiddleware)
  // Rate limiting is applied only to auth routes, not globally
  app.use(compression())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(cookieParser())

  // Session for OAuth (if needed)
  app.use(
    session({
      secret: env.JWT_SECRET,
      resave: false,
      saveUninitialized: env.NODE_ENV === 'development', // Save uninitialized sessions in development to create cookies
      name: 'sessionId', // Custom session name
      cookie: {
        secure: false, // Always false in development (true requires HTTPS)
        httpOnly: true,
        sameSite: 'lax', // 'lax' works best for development, allows cookies on same-site requests
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/', // Available for all paths
        domain: env.NODE_ENV === 'development' ? undefined : undefined // Don't set domain in development
      }
    })
  )

  // Initialize Passport
  app.use(passport.initialize())
  app.use(passport.session())

  app.use(mongoSanitizeMiddleware)
  app.use(hppMiddleware)
  app.use(xssMiddleware)

  // Logging middleware
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  } else {
    app.use(morgan('combined'))
  }

  // API routes
  app.use('/api', routes)

  // Root route
  app.get('/', (_req, res) => {
    res.json({
      message: 'Welcome to the API',
      version: '1.0.0',
      documentation: '/api/health'
    })
  })

  // 404 handler
  app.use(notFoundHandler)

  // Error handler (must be last)
  app.use(errorHandler)

  return app
}

export default createApp
