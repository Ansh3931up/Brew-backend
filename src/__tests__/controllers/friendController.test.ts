import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  searchUsers,
  sendFriendRequest,
  getFriends
} from '../../controllers/friendController.js'
import User from '../../models/User.js'
import Friend from '../../models/Friend.js'
import type { IFriend } from '../../models/Friend.js'
import type { IUser } from '../../models/User.js'
import { createAuthRequest, createMockResponse } from '../helpers/testHelpers.js'
import { HTTP_STATUS } from '../../utils/constants.js'
import type { Request, Response } from 'express'

// Mock models
jest.mock('../../models/User.js')
jest.mock('../../models/Friend.js')

describe('Friend Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('searchUsers', () => {
    it('should search users by email', async () => {
      const req = createAuthRequest() as Partial<Request> & { query: { email: string } }
      req.query = { email: 'test@example.com' }
      const res = createMockResponse()

      const mockUsers = [
        {
          _id: { toString: () => '2' },
          name: 'Test User 2',
          email: 'test2@example.com'
        }
      ]

      ;(User.find as jest.Mock<any>).mockReturnValue({
        select: jest.fn<any>().mockReturnThis(),
        limit: jest.fn<any>().mockResolvedValue(mockUsers)
      })

      ;(Friend.find as jest.Mock<any>).mockResolvedValue([])

      await searchUsers(req as Request, res as unknown as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalled()
    })

    it('should return error if email not provided', async () => {
      const req = createAuthRequest() as Partial<Request> & {
        query: Record<string, unknown>
      }
      req.query = {}
      const res = createMockResponse()

      await searchUsers(req as Request, res as unknown as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
    })
  })

  describe('sendFriendRequest', () => {
    it('should send friend request successfully', async () => {
      const req = createAuthRequest() as Partial<Request> & {
        body: { recipientId: string }
      }
      req.body = { recipientId: '507f1f77bcf86cd799439011' }
      const res = createMockResponse()

      const mockRecipient = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Recipient',
        email: 'recipient@example.com'
      } as Partial<IUser>

      const mockFriendRequest = {
        _id: { toString: () => 'req123' },
        requesterId: {
          _id: { toString: () => '1' },
          name: 'User',
          email: 'user@example.com'
        },
        recipientId: {
          _id: { toString: () => '2' },
          name: 'Recipient',
          email: 'recipient@example.com'
        },
        status: 'pending' as const,
        createdAt: new Date(),
        populate: jest.fn<any>().mockResolvedValue(undefined)
      } as unknown as IFriend

      ;(User.findById as jest.Mock<any>).mockResolvedValue(mockRecipient as IUser)
      ;(Friend.findOne as jest.Mock<any>).mockResolvedValue(null)
      ;(Friend.create as jest.Mock<any>).mockResolvedValue(mockFriendRequest)

      await sendFriendRequest(req as Request, res as unknown as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED)
    })

    it('should return error if recipient not found', async () => {
      const req = createAuthRequest() as Partial<Request> & {
        body: { recipientId: string }
      }
      req.body = { recipientId: '507f1f77bcf86cd799439011' }
      const res = createMockResponse()

      ;(User.findById as jest.Mock<any>).mockResolvedValue(null)

      await sendFriendRequest(req as Request, res as unknown as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
    })
  })

  describe('getFriends', () => {
    it('should get friends list', async () => {
      const req = createAuthRequest() as Partial<Request>
      const res = createMockResponse()

      const mockFriends = [
        {
          _id: { toString: () => 'fr1' },
          requesterId: {
            _id: { toString: () => '1' },
            name: 'User',
            email: 'user@example.com'
          },
          recipientId: {
            _id: { toString: () => '2' },
            name: 'Friend',
            email: 'friend@example.com'
          },
          status: 'accepted' as const,
          createdAt: new Date()
        }
      ] as unknown as IFriend[]

      ;(Friend.find as jest.Mock<any>).mockReturnValue({
        populate: jest.fn<any>().mockReturnThis(),
        sort: jest.fn<any>().mockResolvedValue(mockFriends)
      })

      await getFriends(req as Request, res as unknown as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalled()
    })
  })
})
