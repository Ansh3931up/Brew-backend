import { HTTP_STATUS } from './constants.js'
import { ERROR_CODES } from './constants.js'

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly errors?: Record<string, string[]>

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    isOperational: boolean = true,
    errors?: Record<string, string[]>
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.errors = errors

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  // Static factory methods for common errors
  static badRequest(message: string, errors?: Record<string, string[]>): ApiError {
    return new ApiError(
      message,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      true,
      errors
    )
  }

  static unauthorized(message: string = 'Unauthorized access'): ApiError {
    return new ApiError(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, true)
  }

  static forbidden(message: string = 'Forbidden access'): ApiError {
    return new ApiError(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, true)
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true)
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_ENTRY, true)
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      false
    )
  }
}
