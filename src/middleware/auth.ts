import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { sendError } from '../utils/response.js'
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js'
import env from '../config/env.js'
import User from '../models/User.js'

// AuthRequest type is now handled by express.d.ts global declaration
export type AuthRequest = Request

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    }

    const token = authHeader.substring(7)

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string }

    // Get user from database
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    }

    req.user = user
    return next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 'Invalid token', HTTP_STATUS.UNAUTHORIZED)
    }
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 'Token expired', HTTP_STATUS.UNAUTHORIZED)
    }
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
  }
}
