import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { register, login, getCurrentUser } from '../../controllers/authController.js'
import User from '../../models/User.js'
import {
  createMockRequest,
  createMockResponse,
  createAuthRequest
} from '../helpers/testHelpers.js'
import { HTTP_STATUS } from '../../utils/constants.js'
import type { Request, Response } from 'express'

// Mock User model
jest.mock('../../models/User.js')

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = createMockRequest({
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      }) as Partial<Request>
      const res = createMockResponse() as Partial<Response> & {
        status: jest.Mock
        json: jest.Mock
      }

      const mockUser = {
        _id: { toString: () => '123' },
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        generateToken: jest.fn().mockReturnValue('mock-token')
      }

      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)
      ;(User.create as jest.Mock).mockResolvedValueOnce(mockUser)

      await register(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED)
      expect(res.json).toHaveBeenCalled()
      const responseData = res.json.mock.calls[0][0]
      expect(responseData.success).toBe(true)
      expect(responseData.data.user.email).toBe('test@example.com')
      expect(responseData.data.token).toBe('mock-token')
    })

    it('should return error if user already exists', async () => {
      const req = createMockRequest({
        body: {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        }
      }) as Partial<Request>
      const res = createMockResponse() as Partial<Response> & {
        status: jest.Mock
        json: jest.Mock
      }

      ;(User.findOne as jest.Mock).mockResolvedValueOnce({
        email: 'existing@example.com'
      })

      await register(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT)
      expect(res.json).toHaveBeenCalled()
      const responseData = res.json.mock.calls[0][0]
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('already exists')
    })
  })

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      }) as Partial<Request>
      const res = createMockResponse() as Partial<Response> & {
        status: jest.Mock
        json: jest.Mock
      }

      const mockUser = {
        _id: { toString: () => '123' },
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        generateToken: jest.fn().mockReturnValue('mock-token')
      }

      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

      await login(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalled()
      const responseData = res.json.mock.calls[0][0]
      expect(responseData.success).toBe(true)
      expect(responseData.data.token).toBe('mock-token')
    })

    it('should return error for invalid email', async () => {
      const req = createMockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      }) as Partial<Request>
      const res = createMockResponse() as Partial<Response> & {
        status: jest.Mock
        json: jest.Mock
      }

      ;(User.findOne as jest.Mock).mockResolvedValueOnce(null)

      await login(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
      expect(res.json).toHaveBeenCalled()
      const responseData = res.json.mock.calls[0][0]
      expect(responseData.success).toBe(false)
    })

    it('should return error for invalid password', async () => {
      const req = createMockRequest({
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      }) as Partial<Request>
      const res = createMockResponse() as Partial<Response> & {
        status: jest.Mock
        json: jest.Mock
      }

      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false)
      }

      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)

      await login(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
      expect(res.json).toHaveBeenCalled()
      const responseData = res.json.mock.calls[0][0]
      expect(responseData.success).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        _id: { toString: () => '123' },
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date()
      }

      const req = createAuthRequest(mockUser) as Partial<Request>
      const res = createMockResponse() as Partial<Response> & {
        status: jest.Mock
        json: jest.Mock
      }

      await getCurrentUser(req, res)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalled()
      const responseData = res.json.mock.calls[0][0]
      expect(responseData.success).toBe(true)
      expect(responseData.data.user.email).toBe('test@example.com')
    })
  })
})
