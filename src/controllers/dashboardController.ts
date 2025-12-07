import { Request, Response } from 'express'
import { sendSuccess, sendError } from '../utils/response.js'
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js'
import Task from '../models/Task.js'
import type { IUser } from '../models/User.js'

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user as IUser | undefined
    const userId = user?._id

    if (!userId) {
      return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED)
    }

    // Get current date - handle timezone properly
    // MongoDB stores dates in UTC, so we need to compare correctly
    const now = new Date()

    // Get today's date string in YYYY-MM-DD format (UTC)
    const todayDateString = now.toISOString().split('T')[0]

    // Create date objects for start of today and tomorrow in UTC
    const todayStart = new Date(todayDateString + 'T00:00:00.000Z')
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1)

    // Get all tasks for the user (excluding completed for "all" count)
    const allTasksQuery = { userId, status: { $ne: 'completed' } }
    const allCount = await Task.countDocuments(allTasksQuery)

    // Get today's tasks (due date is today and not completed)
    // Compare using UTC dates to match how MongoDB stores dates
    const todayTasksQuery = {
      userId,
      dueDate: {
        $gte: todayStart,
        $lt: tomorrowStart
      },
      status: { $ne: 'completed' }
    }
    const todayCount = await Task.countDocuments(todayTasksQuery)

    // Get missed tasks (due date is in the past and not completed)
    const missedTasksQuery = {
      userId,
      dueDate: { $lt: todayStart },
      status: { $ne: 'completed' }
    }
    const missedCount = await Task.countDocuments(missedTasksQuery)

    // Get scheduled tasks (due date is in the future and not completed)
    const scheduledTasksQuery = {
      userId,
      dueDate: { $gte: tomorrowStart },
      status: { $ne: 'completed' }
    }
    const scheduledCount = await Task.countDocuments(scheduledTasksQuery)

    // Get flagged tasks
    const flaggedTasksQuery = {
      userId,
      flagged: true
    }
    const flaggedCount = await Task.countDocuments(flaggedTasksQuery)

    // Get completed tasks
    const completedTasksQuery = {
      userId,
      status: 'completed'
    }
    const completedCount = await Task.countDocuments(completedTasksQuery)

    // Get assigned tasks (tasks assigned to this user by friends)
    // Count all assigned tasks, including completed ones for accurate count
    const assignedTasksQuery = {
      userId,
      assignedBy: { $exists: true, $ne: null }
    }
    const friendsCount = await Task.countDocuments(assignedTasksQuery)

    return sendSuccess(
      res,
      {
        all: allCount,
        today: todayCount,
        scheduled: scheduledCount,
        flagged: flaggedCount,
        completed: completedCount,
        friends: friendsCount,
        missed: missedCount
      },
      'Dashboard stats retrieved successfully'
    )
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }
}
