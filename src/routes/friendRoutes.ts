import { Router } from 'express'
import {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend
} from '../controllers/friendController.js'
import {
  sendFriendRequestValidation,
  searchUsersValidation,
  friendRequestIdValidation
} from '../middleware/friendValidation.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Search users by email
router.get('/search', searchUsersValidation, searchUsers)

// Friend requests
router.get('/requests', getFriendRequests)
router.post('/requests', sendFriendRequestValidation, sendFriendRequest)
router.put('/requests/:id/accept', friendRequestIdValidation, acceptFriendRequest)
router.put('/requests/:id/reject', friendRequestIdValidation, rejectFriendRequest)

// Friends
router.get('/', getFriends)
router.delete('/:id', friendRequestIdValidation, removeFriend)

export default router
