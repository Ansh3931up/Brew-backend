import { Router } from 'express'
import {
  getTasks,
  getAssignedTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTaskToFriend,
  getCompletedTasks,
  getScheduledTasks,
  getFlaggedTasks,
  getTodayTasks,
  getMissedTasks,
  searchAllTasks
} from '../controllers/taskController.js'
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  assignTaskValidation
} from '../middleware/taskValidation.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get tasks with filters
router.get('/', getTasks)
router.get('/search', searchAllTasks)
router.get('/assigned', getAssignedTasks)
router.get('/completed', getCompletedTasks)
router.get('/scheduled', getScheduledTasks)
router.get('/flagged', getFlaggedTasks)
router.get('/today', getTodayTasks)
router.get('/missed', getMissedTasks)
router.get('/:id', taskIdValidation, getTaskById)

// Create task
router.post('/', createTaskValidation, createTask)

// Assign task to friend
router.post('/:id/assign', assignTaskValidation, assignTaskToFriend)

// Update task
router.put('/:id', updateTaskValidation, updateTask)

// Delete task
router.delete('/:id', taskIdValidation, deleteTask)

export default router
