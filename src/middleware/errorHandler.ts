import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js'
import { sendError, sendApiError } from '../utils/response.js'
import { ApiError } from '../utils/ApiError.js'
import { logger } from '../utils/logger.js'
import env from '../config/env.js'

export const errorHandler = (
  err: Error | unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  logger.error('Error occurred:', err)

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return sendApiError(res, err)
  }

  // Validation errors
  if (err instanceof Error && err.name === 'ValidationError') {
    return sendError(
      res,
      ERROR_MESSAGES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR'
    )
  }

  // Default error
  const message =
    env.NODE_ENV === 'production'
      ? ERROR_MESSAGES.INTERNAL_ERROR
      : err instanceof Error
        ? err.message
        : ERROR_MESSAGES.INTERNAL_ERROR

  return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR')
}
