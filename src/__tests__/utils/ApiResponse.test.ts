import { describe, it, expect } from '@jest/globals'
import { ApiResponse } from '../../utils/ApiResponse.js'

describe('ApiResponse', () => {
  describe('success', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const response = ApiResponse.success(data, 'Success message')

      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.message).toBe('Success message')
      expect(response.error).toBeUndefined()
      expect(response.timestamp).toBeDefined()
    })

    it('should create a success response without message', () => {
      const data = { id: 1 }
      const response = ApiResponse.success(data)

      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.message).toBeUndefined()
    })
  })

  describe('error', () => {
    it('should create an error response', () => {
      const response = ApiResponse.error('Error message', 'ERROR_CODE')

      expect(response.success).toBe(false)
      expect(response.error).toBe('Error message')
      expect(response.code).toBe('ERROR_CODE')
      expect(response.data).toBeUndefined()
      expect(response.timestamp).toBeDefined()
    })

    it('should create an error response with validation errors', () => {
      const errors = {
        email: ['Email is required'],
        password: ['Password must be at least 6 characters']
      }
      const response = ApiResponse.error('Validation failed', 'VALIDATION_ERROR', errors)

      expect(response.success).toBe(false)
      expect(response.error).toBe('Validation failed')
      expect(response.code).toBe('VALIDATION_ERROR')
      expect(response.errors).toEqual(errors)
    })
  })

  describe('toJSON', () => {
    it('should convert response to JSON object', () => {
      const response = ApiResponse.success({ id: 1 }, 'Success')
      const json = response.toJSON()

      expect(json).toHaveProperty('success', true)
      expect(json).toHaveProperty('data', { id: 1 })
      expect(json).toHaveProperty('message', 'Success')
      expect(json).toHaveProperty('timestamp')
    })

    it('should not include undefined fields in JSON', () => {
      const response = ApiResponse.success({ id: 1 })
      const json = response.toJSON()

      expect(json).not.toHaveProperty('message')
      expect(json).not.toHaveProperty('error')
      expect(json).not.toHaveProperty('code')
    })
  })
})
