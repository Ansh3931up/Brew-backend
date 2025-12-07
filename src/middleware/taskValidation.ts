import { body, param } from 'express-validator'
import { validate } from './validation.js'

export const createTaskValidation = validate([
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (value) {
        const dueDate = new Date(value)
        dueDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (dueDate < today) {
          throw new Error('Due date cannot be in the past')
        }
      }
      return true
    }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'active', 'completed'])
    .withMessage('Status must be todo, active, or completed'),
  body('flagged').optional().isBoolean().withMessage('Flagged must be a boolean')
])

export const updateTaskValidation = validate([
  param('id')
    .notEmpty()
    .withMessage('Task ID is required')
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (value) {
        const dueDate = new Date(value)
        dueDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (dueDate < today) {
          throw new Error('Due date cannot be in the past')
        }
      }
      return true
    }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'active', 'completed'])
    .withMessage('Status must be todo, active, or completed'),
  body('flagged').optional().isBoolean().withMessage('Flagged must be a boolean')
])

export const taskIdValidation = validate([
  param('id')
    .notEmpty()
    .withMessage('Task ID is required')
    .isMongoId()
    .withMessage('Invalid task ID')
])

export const assignTaskValidation = validate([
  param('id')
    .notEmpty()
    .withMessage('Task ID is required')
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('friendId')
    .notEmpty()
    .withMessage('Friend ID is required')
    .isMongoId()
    .withMessage('Invalid friend ID')
])
