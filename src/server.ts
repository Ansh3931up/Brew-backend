import express, { Express } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { logger } from './utils/logger.js';
import {
  corsMiddleware,
  rateLimitMiddleware,
  helmetMiddleware,
  mongoSanitizeMiddleware,
  hppMiddleware,
  xssMiddleware,
} from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import routes from './routes/index.js';

const app: Express = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware (order matters!)
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);
app.use(xssMiddleware);

// Logging middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api', routes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 CORS enabled for: ${env.CORS_ORIGIN}`);
  logger.info(`🔒 Rate limit: ${env.RATE_LIMIT_MAX_REQUESTS} requests per ${env.RATE_LIMIT_WINDOW_MS / 1000}s`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
