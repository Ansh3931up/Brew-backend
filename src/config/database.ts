import mongoose from 'mongoose'
import env from './env.js'
import { logger } from '../utils/logger.js'

const connectDatabase = async (): Promise<void> => {
  try {
    // Clean up DATABASE_URL to remove problematic write concern for standalone instances
    let databaseUrl = env.DATABASE_URL

    // Remove write concern parameters that don't work with standalone MongoDB
    // The error shows w=majority/task-tracker which doesn't work with standalone instances
    // Remove all w= parameters (majority, 1, 2, etc. with any suffix)
    databaseUrl = databaseUrl
      .replace(/[?&]w=[^&]*/g, '') // Remove w=anything
      .replace(/[?&]wtimeout=\d+/g, '') // Remove wtimeout
      .replace(/\?&/, '?') // Fix double ?&
      .replace(/&+/g, '&') // Fix multiple &
      .replace(/\?$/, '') // Remove trailing ?
      .replace(/&$/, '') // Remove trailing &

    const conn = await mongoose.connect(databaseUrl, {
      // For standalone MongoDB, use simple write concern
      // This overrides any write concern in the connection string
      writeConcern: { w: 1 } // Acknowledge write to primary only (standalone)
    })

    logger.info(`MongoDB Connected: ${conn.connection.host}`)

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })
  } catch (error) {
    logger.error('Database connection failed:', error)
    process.exit(1)
  }
}

export default connectDatabase
