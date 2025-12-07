import type { IUser } from '../models/User.js'

declare module 'express-session' {
  interface SessionData {
    userId?: string
    userEmail?: string
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export {}
