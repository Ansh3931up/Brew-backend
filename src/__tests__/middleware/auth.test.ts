import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { authenticate } from '../../middleware/auth.js'
import {
  createMockRequest,
  createMockResponse,
  createMockNext
} from '../helpers/testHelpers.js'
import jwt from 'jsonwebtoken'
import User from '../../models/User.js'
import { HTTP_STATUS } from '../../utils/constants.js'
import type { Request } from 'express'

jest.mock('../../models/User.js')

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should authenticate user with valid token', async () => {
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer valid-token'
      }
    }) as Partial<Request>
    const res = createMockResponse()
    const next = createMockNext()

    const mockUser = {
      _id: { toString: () => '123' },
      name: 'Test User',
      email: 'test@example.com'
    }

    jest
      .spyOn(jwt, 'verify')
      .mockReturnValue({ id: '123', email: 'test@example.com' } as jwt.JwtPayload)
    ;(User.findById as jest.Mock).mockResolvedValueOnce(mockUser)

    await authenticate(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual(mockUser)
  })

  it('should return 401 if no authorization header', async () => {
    const req = createMockRequest() as Partial<Request>
    const res = createMockResponse()
    const next = createMockNext()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 if invalid token', async () => {
    const req = createMockRequest({
      headers: {
        authorization: 'Bearer invalid-token'
      }
    }) as Partial<Request>
    const res = createMockResponse()
    const next = createMockNext()

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Invalid token')
    })

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
    expect(next).not.toHaveBeenCalled()
  })
})
