import { Request, Response } from 'express'
import { sendSuccess, sendError } from '../utils/response.js'
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js'

// Example user controller
// Replace with actual database operations

export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // TODO: Fetch users from database
    const users = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ]

    return sendSuccess(res, users, 'Users retrieved successfully')
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params

    // TODO: Fetch user from database
    const user = { id, name: 'John Doe', email: 'john@example.com' }

    if (!user) {
      return sendError(res, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    return sendSuccess(res, user, 'User retrieved successfully')
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const createUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email } = req.body

    // TODO: Create user in database
    const newUser = { id: '3', name, email }

    return sendSuccess(res, newUser, 'User created successfully', HTTP_STATUS.CREATED)
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params
    const { name, email } = req.body

    // TODO: Update user in database
    const updatedUser = { id, name, email }

    return sendSuccess(res, updatedUser, 'User updated successfully')
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: _id } = req.params

    // TODO: Delete user from database using _id

    return sendSuccess(res, null, 'User deleted successfully', HTTP_STATUS.NO_CONTENT)
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
