import { Request, Response } from 'express'
import { sendSuccess, sendError } from '../utils/response.js'
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js'
import User from '../models/User.js'
import Friend from '../models/Friend.js'
import type { IUser } from '../models/User.js'

export const searchUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.query
    const user = req.user as IUser | undefined
    const currentUserId = user?._id

    if (!email || typeof email !== 'string') {
      return sendError(res, 'Email query parameter is required', HTTP_STATUS.BAD_REQUEST)
    }

    // Search users by email (exclude current user)
    const users = await User.find({
      email: { $regex: email.toLowerCase(), $options: 'i' },
      _id: { $ne: currentUserId }
    })
      .select('name email')
      .limit(10)

    // Get existing friend relationships
    const friendRelations = await Friend.find({
      $or: [{ requesterId: currentUserId }, { recipientId: currentUserId }],
      status: 'accepted'
    })

    const friendIds = new Set(
      friendRelations.map((fr) =>
        fr.requesterId.toString() === currentUserId?.toString()
          ? fr.recipientId.toString()
          : fr.requesterId.toString()
      )
    )

    // Filter out existing friends
    const filteredUsers = users.filter((user) => !friendIds.has(user._id.toString()))

    return sendSuccess(
      res,
      filteredUsers.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email
      })),
      'Users found'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const sendFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { recipientId } = req.body
    const user = req.user as IUser | undefined
    const requesterId = user?._id

    if (!recipientId) {
      return sendError(res, 'Recipient ID is required', HTTP_STATUS.BAD_REQUEST)
    }

    if (requesterId?.toString() === recipientId) {
      return sendError(
        res,
        'Cannot send friend request to yourself',
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // Check if recipient exists
    const recipientUserCheck = await User.findById(recipientId)
    if (!recipientUserCheck) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND)
    }

    // Check if friend request already exists
    const existingRequest = await Friend.findOne({
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId }
      ]
    })

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return sendError(res, 'Friend request already sent', HTTP_STATUS.CONFLICT)
      }
      if (existingRequest.status === 'accepted') {
        return sendError(res, 'Already friends', HTTP_STATUS.CONFLICT)
      }
    }

    // Create friend request
    const friendRequest = await Friend.create({
      requesterId,
      recipientId,
      status: 'pending'
    })

    // Populate user details
    await friendRequest.populate('requesterId', 'name email')
    await friendRequest.populate('recipientId', 'name email')

    const requester = friendRequest.requesterId as IUser
    const recipientPopulated = friendRequest.recipientId as IUser

    return sendSuccess(
      res,
      {
        id: friendRequest._id.toString(),
        requester: {
          id: requester._id.toString(),
          name: requester.name,
          email: requester.email
        },
        recipient: {
          id: recipientPopulated._id.toString(),
          name: recipientPopulated.name,
          email: recipientPopulated.email
        },
        status: friendRequest.status,
        createdAt: friendRequest.createdAt
      },
      'Friend request sent successfully',
      HTTP_STATUS.CREATED
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate')) {
      return sendError(res, 'Friend request already exists', HTTP_STATUS.CONFLICT)
    }
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const getFriendRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { type } = req.query
    const user = req.user as IUser | undefined
    const userId = user?._id

    let query: Record<string, unknown> = {}

    if (type === 'sent') {
      query = { requesterId: userId, status: 'pending' }
    } else if (type === 'received') {
      query = { recipientId: userId, status: 'pending' }
    } else {
      // Get both sent and received
      query = {
        $or: [
          { requesterId: userId, status: 'pending' },
          { recipientId: userId, status: 'pending' }
        ]
      }
    }

    const requests = await Friend.find(query)
      .populate('requesterId', 'name email')
      .populate('recipientId', 'name email')
      .sort({ createdAt: -1 })

    const formattedRequests = requests.map((req) => {
      const requester = req.requesterId as IUser
      const recipient = req.recipientId as IUser
      return {
        id: req._id.toString(),
        requester: {
          id: requester._id.toString(),
          name: requester.name,
          email: requester.email
        },
        recipient: {
          id: recipient._id.toString(),
          name: recipient.name,
          email: recipient.email
        },
        status: req.status,
        isSent: requester._id.toString() === userId?.toString(),
        createdAt: req.createdAt
      }
    })

    return sendSuccess(res, formattedRequests, 'Friend requests retrieved successfully')
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const acceptFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params
    const user = req.user as IUser | undefined
    const userId = user?._id

    const friendRequest = await Friend.findById(id)

    if (!friendRequest) {
      return sendError(res, 'Friend request not found', HTTP_STATUS.NOT_FOUND)
    }

    // Verify that the current user is the recipient
    if (friendRequest.recipientId.toString() !== userId?.toString()) {
      return sendError(res, 'Unauthorized to accept this request', HTTP_STATUS.FORBIDDEN)
    }

    if (friendRequest.status !== 'pending') {
      return sendError(res, 'Friend request is not pending', HTTP_STATUS.BAD_REQUEST)
    }

    friendRequest.status = 'accepted'
    await friendRequest.save()

    await friendRequest.populate('requesterId', 'name email')
    await friendRequest.populate('recipientId', 'name email')

    const requester = friendRequest.requesterId as IUser
    const recipientUser = friendRequest.recipientId as IUser

    return sendSuccess(
      res,
      {
        id: friendRequest._id.toString(),
        requester: {
          id: requester._id.toString(),
          name: requester.name,
          email: requester.email
        },
        recipient: {
          id: recipientUser._id.toString(),
          name: recipientUser.name,
          email: recipientUser.email
        },
        status: friendRequest.status
      },
      'Friend request accepted'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const rejectFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params
    const user = req.user as IUser | undefined
    const userId = user?._id

    const friendRequest = await Friend.findById(id)

    if (!friendRequest) {
      return sendError(res, 'Friend request not found', HTTP_STATUS.NOT_FOUND)
    }

    // Verify that the current user is the recipient
    if (friendRequest.recipientId.toString() !== userId?.toString()) {
      return sendError(res, 'Unauthorized to reject this request', HTTP_STATUS.FORBIDDEN)
    }

    // Delete the friend request
    await Friend.findByIdAndDelete(id)

    return sendSuccess(res, null, 'Friend request rejected', HTTP_STATUS.NO_CONTENT)
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const getFriends = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id

    const friendRelations = await Friend.find({
      $or: [
        { requesterId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' }
      ]
    })
      .populate('requesterId', 'name email')
      .populate('recipientId', 'name email')
      .sort({ updatedAt: -1 })

    const friends = friendRelations.map((fr) => {
      const requester = fr.requesterId as IUser
      const recipient = fr.recipientId as IUser
      const friend =
        requester._id.toString() === userId?.toString() ? recipient : requester

      return {
        id: friend._id.toString(),
        name: friend.name,
        email: friend.email,
        friendshipId: fr._id.toString(),
        createdAt: fr.createdAt
      }
    })

    return sendSuccess(res, friends, 'Friends retrieved successfully')
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const removeFriend = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params
    const user = req.user as IUser | undefined
    const userId = user?._id

    const friendRelation = await Friend.findOne({
      _id: id,
      status: 'accepted',
      $or: [{ requesterId: userId }, { recipientId: userId }]
    })

    if (!friendRelation) {
      return sendError(res, 'Friend relationship not found', HTTP_STATUS.NOT_FOUND)
    }

    await Friend.findByIdAndDelete(id)

    return sendSuccess(res, null, 'Friend removed successfully', HTTP_STATUS.NO_CONTENT)
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
