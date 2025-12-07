import { Request, Response } from 'express'
import { sendSuccess, sendError } from '../utils/response.js'
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js'
import Task from '../models/Task.js'
import Friend from '../models/Friend.js'
import User from '../models/User.js'
import type { IUser } from '../models/User.js'

export const getTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id
    const { status, search, priority, flagged, all } = req.query

    const query: Record<string, unknown> = { userId }

    // Filter by status
    if (
      status &&
      typeof status === 'string' &&
      ['todo', 'active', 'completed'].includes(status)
    ) {
      query.status = status
    }

    // Filter by priority
    if (
      priority &&
      typeof priority === 'string' &&
      ['low', 'medium', 'high'].includes(priority)
    ) {
      query.priority = priority
    }

    // Filter by flagged
    if (flagged !== undefined && typeof flagged === 'string') {
      query.flagged = flagged === 'true'
    }

    // Search by title or description
    if (search && typeof search === 'string' && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    // If 'all' flag is set, exclude completed tasks
    if (all !== undefined && typeof all === 'string' && all === 'true') {
      // Remove status filter if it exists, but exclude completed tasks
      delete query.status
      query.status = { $ne: 'completed' }
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 })

    return sendSuccess(
      res,
      tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      'Tasks retrieved successfully'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const getAssignedTasks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id

    const tasks = await Task.find({
      userId,
      assignedBy: { $exists: true, $ne: null }
    })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })

    return sendSuccess(
      res,
      tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?._id.toString(),
        assignedByEmail:
          task.assignedByEmail || (task.assignedBy as unknown as IUser)?.email,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      'Assigned tasks retrieved successfully'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const getTaskById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params
    const user = req.user as IUser | undefined
    const userId = user?._id

    const task = await Task.findOne({ _id: id, userId })

    if (!task) {
      return sendError(res, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    return sendSuccess(
      res,
      {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      },
      'Task retrieved successfully'
    )
  } catch (error) {
    return sendError(res, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
  }
}

export const createTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined

    // Validate user is authenticated
    if (!user || !user._id) {
      console.error('Create task: User not authenticated', {
        user: user ? 'exists' : 'null',
        userId: user?._id
      })
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    }

    const userId = user._id
    const { title, description, dueDate, priority, status } = req.body

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return sendError(res, 'Title is required', HTTP_STATUS.BAD_REQUEST)
    }

    // Validate userId is a valid ObjectId
    if (!userId || !userId.toString) {
      console.error('Create task: Invalid userId', { userId, user })
      return sendError(res, 'Invalid user ID', HTTP_STATUS.BAD_REQUEST)
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      status: status || 'todo',
      flagged: req.body.flagged || false,
      userId
    })

    return sendSuccess(
      res,
      {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      },
      'Task created successfully',
      HTTP_STATUS.CREATED
    )
  } catch (error) {
    // Log error for debugging
    console.error('Create task error:', error)

    if (error instanceof Error) {
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const mongooseError = error as { errors?: Record<string, { message: string }> }
        const errorMessages = Object.values(mongooseError.errors || {}).map(
          (err: { message: string }) => err.message
        )
        return sendError(
          res,
          errorMessages.join(', ') || error.message,
          HTTP_STATUS.BAD_REQUEST,
          'VALIDATION_ERROR'
        )
      }
      // Handle MongoDB cast errors (invalid ObjectId, etc.)
      if (error.name === 'CastError') {
        return sendError(res, 'Invalid data format', HTTP_STATUS.BAD_REQUEST)
      }
      // Handle required field errors
      if (error.message.includes('required') || error.message.includes('Required')) {
        return sendError(res, error.message, HTTP_STATUS.BAD_REQUEST)
      }
    }
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const updateTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params
    const user = req.user as IUser | undefined
    const userId = user?._id
    const updates = req.body

    const task = await Task.findOne({ _id: id, userId })

    if (!task) {
      return sendError(res, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    // Update fields
    if (updates.title !== undefined) task.title = updates.title
    if (updates.description !== undefined) task.description = updates.description
    if (updates.dueDate !== undefined) {
      task.dueDate = updates.dueDate ? new Date(updates.dueDate) : undefined
    }
    if (updates.priority !== undefined) task.priority = updates.priority
    if (updates.status !== undefined) task.status = updates.status
    if (updates.flagged !== undefined) task.flagged = updates.flagged

    await task.save()

    return sendSuccess(
      res,
      {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      },
      'Task updated successfully'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const deleteTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params
    const user = req.user as IUser | undefined
    const userId = user?._id

    const task = await Task.findOneAndDelete({ _id: id, userId })

    if (!task) {
      return sendError(res, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND)
    }

    return sendSuccess(res, null, 'Task deleted successfully', HTTP_STATUS.NO_CONTENT)
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const assignTaskToFriend = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params
    const { friendId } = req.body
    const user = req.user as IUser | undefined
    const currentUserId = user?._id

    if (!friendId) {
      return sendError(res, 'Friend ID is required', HTTP_STATUS.BAD_REQUEST)
    }

    // Verify friendship exists
    const friendship = await Friend.findOne({
      status: 'accepted',
      $or: [
        { requesterId: currentUserId, recipientId: friendId },
        { requesterId: friendId, recipientId: currentUserId }
      ]
    })

    if (!friendship) {
      return sendError(res, 'Friendship does not exist', HTTP_STATUS.BAD_REQUEST)
    }

    // Get the original task
    const originalTask = await Task.findOne({ _id: id, userId: currentUserId })

    if (!originalTask) {
      return sendError(res, 'Task not found', HTTP_STATUS.NOT_FOUND)
    }

    // Get friend's email
    const friend = await User.findById(friendId).select('email name')
    if (!friend) {
      return sendError(res, 'Friend not found', HTTP_STATUS.NOT_FOUND)
    }

    // Create a new task for the friend
    const assignedTask = await Task.create({
      title: originalTask.title,
      description: originalTask.description,
      dueDate: originalTask.dueDate,
      priority: originalTask.priority,
      status: 'todo', // Reset to todo when assigned
      userId: friendId,
      assignedBy: currentUserId,
      assignedByEmail: user?.email
    })

    return sendSuccess(
      res,
      {
        id: assignedTask._id.toString(),
        title: assignedTask.title,
        description: assignedTask.description,
        dueDate: assignedTask.dueDate?.toISOString(),
        priority: assignedTask.priority,
        status: assignedTask.status,
        flagged: assignedTask.flagged || false,
        assignedBy: assignedTask.assignedBy?.toString(),
        assignedByEmail: assignedTask.assignedByEmail,
        createdAt: assignedTask.createdAt.toISOString(),
        updatedAt: assignedTask.updatedAt.toISOString()
      },
      'Task assigned to friend successfully',
      HTTP_STATUS.CREATED
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// Get completed tasks
export const getCompletedTasks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id
    const { search } = req.query

    const query: Record<string, unknown> = {
      userId,
      status: 'completed'
    }

    // Search by title or description
    if (search && typeof search === 'string' && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const tasks = await Task.find(query).sort({ completedAt: -1, createdAt: -1 })

    return sendSuccess(
      res,
      tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      'Completed tasks retrieved successfully'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// Get scheduled tasks (tasks with dueDate > today and not completed)
export const getScheduledTasks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id
    const { search } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const query: Record<string, unknown> = {
      userId,
      dueDate: { $gt: today },
      status: { $ne: 'completed' }
    }

    // Search by title or description
    if (search && typeof search === 'string' && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 })

    return sendSuccess(
      res,
      tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      'Scheduled tasks retrieved successfully'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// Get flagged tasks (only tasks with flagged = true)
export const getFlaggedTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id
    const { search } = req.query

    const query: Record<string, unknown> = {
      userId,
      flagged: true
    }

    // Search by title or description
    if (search && typeof search === 'string' && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const tasks = await Task.find(query).sort({ priority: -1, createdAt: -1 })

    return sendSuccess(
      res,
      tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      'Flagged tasks retrieved successfully'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// Get today's tasks (tasks with dueDate = today)
export const getTodayTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id
    const { search } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const query: Record<string, unknown> = {
      userId,
      dueDate: {
        $gte: today,
        $lt: tomorrow
      }
    }

    // Search by title or description
    if (search && typeof search === 'string' && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const tasks = await Task.find(query).sort({ priority: -1, createdAt: -1 })

    return sendSuccess(
      res,
      tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      "Today's tasks retrieved successfully"
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

// Get missed tasks (tasks with dueDate < today and not completed)
export const searchAllTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id
    const { search } = req.query

    if (!search || typeof search !== 'string' || !search.trim()) {
      return sendError(res, 'Search query is required', HTTP_STATUS.BAD_REQUEST)
    }

    const searchQuery = search.trim()

    // Search in user's own tasks
    const userTasksQuery = {
      userId,
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    }

    // Search in assigned tasks (tasks assigned to this user)
    const assignedTasksQuery = {
      userId,
      assignedBy: { $exists: true, $ne: null },
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    }

    const [userTasks, assignedTasks] = await Promise.all([
      Task.find(userTasksQuery).sort({ createdAt: -1 }),
      Task.find(assignedTasksQuery)
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 })
    ])

    // Combine and format results
    const allTasks = [
      ...userTasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        isAssigned: false
      })),
      ...assignedTasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?._id.toString(),
        assignedByEmail:
          task.assignedByEmail || (task.assignedBy as unknown as IUser)?.email,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        isAssigned: true
      }))
    ]

    // Remove duplicates (in case a task appears in both queries)
    const uniqueTasks = Array.from(
      new Map(allTasks.map((task) => [task.id, task])).values()
    )

    return sendSuccess(res, uniqueTasks, 'Search results retrieved successfully')
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}

export const getMissedTasks = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id
    const { search } = req.query

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const query: Record<string, unknown> = {
      userId,
      dueDate: { $lt: today },
      status: { $ne: 'completed' }
    }

    // Search by title or description
    if (search && typeof search === 'string' && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, priority: -1, createdAt: -1 })

    return sendSuccess(
      res,
      tasks.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate?.toISOString(),
        priority: task.priority,
        status: task.status,
        flagged: task.flagged || false,
        assignedBy: task.assignedBy?.toString(),
        assignedByEmail: task.assignedByEmail,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      'Missed tasks retrieved successfully'
    )
  } catch (error) {
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
