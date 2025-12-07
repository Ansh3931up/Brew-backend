import { describe, it, expect } from '@jest/globals'
import { ApiError } from '../../utils/ApiError.js'
import { HTTP_STATUS } from '../../utils/constants.js'

describe('ApiError', () => {
  it('should create an error with default values', () => {
    const error = new ApiError('Test error')

    expect(error.message).toBe('Test error')
    expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(error.code).toBe('INTERNAL_ERROR')
    expect(error.isOperational).toBe(true)
  })

  it('should create an error with custom values', () => {
    const error = new ApiError('Custom error', 400, 'CUSTOM_CODE', false)

    expect(error.message).toBe('Custom error')
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('CUSTOM_CODE')
    expect(error.isOperational).toBe(false)
  })

  it('should create a badRequest error', () => {
    const error = ApiError.badRequest('Invalid input')

    expect(error.message).toBe('Invalid input')
    expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(error.code).toBe('VALIDATION_ERROR')
  })

  it('should create an unauthorized error', () => {
    const error = ApiError.unauthorized()

    expect(error.message).toBe('Unauthorized access')
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED)
    expect(error.code).toBe('UNAUTHORIZED')
  })

  it('should create a notFound error', () => {
    const error = ApiError.notFound('Resource not found')

    expect(error.message).toBe('Resource not found')
    expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND)
    expect(error.code).toBe('NOT_FOUND')
  })

  it('should create a conflict error', () => {
    const error = ApiError.conflict('Duplicate entry')

    expect(error.message).toBe('Duplicate entry')
    expect(error.statusCode).toBe(HTTP_STATUS.CONFLICT)
    expect(error.code).toBe('DUPLICATE_ENTRY')
  })

  it('should include validation errors', () => {
    const errors = {
      email: ['Email is required'],
      password: ['Password is too short']
    }
    const error = ApiError.badRequest('Validation failed', errors)

    expect(error.errors).toEqual(errors)
  })
})
