import { describe, it, expect, jest } from '@jest/globals'
import { sendSuccess, sendError, sendApiError } from '../../utils/response.js'
import { createMockResponse } from '../helpers/testHelpers.js'
import { ApiError } from '../../utils/ApiError.js'
import { HTTP_STATUS } from '../../utils/constants.js'
import type { Response } from 'express'

describe('Response Utils', () => {
  describe('sendSuccess', () => {
    it('should send success response with data', () => {
      const res = createMockResponse()
      const data = { id: 1, name: 'Test' }

      sendSuccess(res as unknown as Response, data, 'Success message')

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalled()
      const responseData = (res.json as jest.Mock).mock.calls[0][0] as {
        success: boolean
        data: unknown
        message: string
      }
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(data)
      expect(responseData.message).toBe('Success message')
    })

    it('should send success response with custom status code', () => {
      const res = createMockResponse()
      const data = { id: 1 }

      sendSuccess(res as unknown as Response, data, 'Created', HTTP_STATUS.CREATED)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED)
    })
  })

  describe('sendError', () => {
    it('should send error response', () => {
      const res = createMockResponse()

      sendError(
        res as unknown as Response,
        'Error message',
        HTTP_STATUS.BAD_REQUEST,
        'ERROR_CODE'
      )

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
      expect(res.json).toHaveBeenCalled()
      const responseData = (res.json as jest.Mock).mock.calls[0][0] as {
        success: boolean
        error: string
        code: string
      }
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Error message')
      expect(responseData.code).toBe('ERROR_CODE')
    })
  })

  describe('sendApiError', () => {
    it('should send ApiError response', () => {
      const res = createMockResponse()
      const error = ApiError.badRequest('Validation failed')

      sendApiError(res as unknown as Response, error)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
      expect(res.json).toHaveBeenCalled()
      const responseData = (res.json as jest.Mock).mock.calls[0][0] as {
        success: boolean
        error: string
        code: string
      }
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Validation failed')
      expect(responseData.code).toBe('VALIDATION_ERROR')
    })
  })
})
