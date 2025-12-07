import { body, param, query } from 'express-validator'
import { validate } from './validation.js'

export const sendFriendRequestValidation = validate([
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required')
    .isMongoId()
    .withMessage('Invalid recipient ID')
])

export const searchUsersValidation = validate([
  query('email')
    .notEmpty()
    .withMessage('Email query parameter is required')
    .isEmail()
    .withMessage('Invalid email format')
])

export const friendRequestIdValidation = validate([
  param('id')
    .notEmpty()
    .withMessage('Request ID is required')
    .isMongoId()
    .withMessage('Invalid request ID')
])
