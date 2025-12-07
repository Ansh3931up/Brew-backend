import { Request, Response } from 'express'
import { sendSuccess, sendError } from '../utils/response.js'
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js'
import User from '../models/User.js'
import type { IUser } from '../models/User.js'

// Type for session with custom properties
interface CustomSession {
  userId?: string
  userEmail?: string
}

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return sendError(
        res,
        'Name, email, and password are required',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return sendError(res, 'User with this email already exists', HTTP_STATUS.CONFLICT)
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    })

    // Generate token
    const token = user.generateToken()

    // Return user without password
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }

    return sendSuccess(
      res,
      { user: userResponse, token },
      'User registered successfully',
      HTTP_STATUS.CREATED
    )
  } catch (error) {
    // Log error for debugging
    console.error('Registration error:', error)

    if (error instanceof Error) {
      // Handle duplicate key error (MongoDB)
      if (error.message.includes('duplicate') || error.message.includes('E11000')) {
        return sendError(res, 'User with this email already exists', HTTP_STATUS.CONFLICT)
      }
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST)
      }
    }
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user || !user.password) {
      return sendError(res, 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED)
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED)
    }

    // Generate token
    const token = user.generateToken()

    // Set session for cookie-based auth (optional, for testing)
    if (req.session) {
      // Type assertion for custom session properties
      const session = req.session as typeof req.session & CustomSession
      session.userId = user._id.toString()
      session.userEmail = user.email
    }

    // Return user without password
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }

    return sendSuccess(res, { user: userResponse, token }, 'Login successful')
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    // req.user is typed via express.d.ts extension
    // Use type assertion to ensure TypeScript recognizes IUser type
    const user = req.user as IUser | undefined

    if (!user) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    }

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }

    return sendSuccess(res, { user: userResponse }, 'User retrieved successfully')
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const logout = async (_req: Request, res: Response): Promise<Response> => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency
  return sendSuccess(res, { message: 'Logged out successfully' }, 'Logout successful')
}
