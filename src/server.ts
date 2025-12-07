import env from './config/env.js'
import { logger } from './utils/logger.js'
import connectDatabase from './config/database.js'
import createApp from './app.js'

// Connect to database
connectDatabase()
  .then(() => {
    // Create Express app
    const app = createApp()

    // Start server
    const PORT = env.PORT

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📝 Environment: ${env.NODE_ENV}`)
      logger.info(`🌐 CORS enabled for: ${env.CORS_ORIGIN}`)
      logger.info(
        `🔒 Rate limit: ${env.RATE_LIMIT_MAX_REQUESTS} requests per ${env.RATE_LIMIT_WINDOW_MS / 1000}s`
      )
      logger.info(`💾 Database: ${env.DATABASE_URL}`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server')
      process.exit(0)
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server')
      process.exit(0)
    })
  })
  .catch((error) => {
    logger.error('Failed to start server:', error)
    process.exit(1)
  })
