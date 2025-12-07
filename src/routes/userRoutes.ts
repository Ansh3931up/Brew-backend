import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { validate } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Validation rules
const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

const updateUserValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

const getUserByIdValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
];

const deleteUserValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
];

// Routes
router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, validate(getUserByIdValidation), getUserById);
router.post('/', authenticate, validate(createUserValidation), createUser);
router.put('/:id', authenticate, validate(updateUserValidation), updateUser);
router.delete('/:id', authenticate, validate(deleteUserValidation), deleteUser);

export default router;
