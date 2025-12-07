import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import type { Request, Response } from 'express'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../../controllers/taskController.js'
import Task from '../../models/Task.js'
import type { ITask } from '../../models/Task.js'
import { createMockResponse, createAuthRequest } from '../helpers/testHelpers.js'
import { HTTP_STATUS } from '../../utils/constants.js'

// Mock models
jest.mock('../../models/Task.js')
jest.mock('../../models/Friend.js')
jest.mock('../../models/User.js')

// Type for mocked task document with save method
type MockTaskDocument = Partial<ITask> & {
  _id: { toString: () => string }
  save: () => Promise<ITask>
}

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTasks', () => {
    it('should get tasks for user', async () => {
      const req = createAuthRequest() as Partial<Request>
      req.query = {}
      const res = createMockResponse() as Partial<Response>

      const mockTasks: ITask[] = [
        {
          _id: { toString: () => 'task1' } as unknown as ITask['_id'],
          title: 'Test Task',
          description: 'Description',
          status: 'todo',
          priority: 'medium',
          createdAt: new Date(),
          updatedAt: new Date()
        } as ITask
      ]

      const mockSort = jest.fn<() => Promise<ITask[]>>().mockResolvedValue(mockTasks)
      ;(Task.find as jest.MockedFunction<typeof Task.find>).mockReturnValue({
        sort: mockSort
      } as unknown as ReturnType<typeof Task.find>)

      await getTasks(req as Request, res as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalled()
    })

    it('should filter tasks by status', async () => {
      const req = createAuthRequest() as Partial<Request>
      req.query = { status: 'completed' }
      const res = createMockResponse() as Partial<Response>

      const mockSort = jest.fn<() => Promise<ITask[]>>().mockResolvedValue([])
      ;(Task.find as jest.MockedFunction<typeof Task.find>).mockReturnValue({
        sort: mockSort
      } as unknown as ReturnType<typeof Task.find>)

      await getTasks(req as Request, res as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
    })
  })

  describe('createTask', () => {
    it('should create a new task', async () => {
      const req = createAuthRequest() as Partial<Request>
      req.body = {
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        dueDate: '2024-12-31'
      }
      const res = createMockResponse() as Partial<Response>

      const mockTask: ITask = {
        _id: { toString: () => 'task1' } as unknown as ITask['_id'],
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        status: 'todo',
        createdAt: new Date(),
        updatedAt: new Date()
      } as ITask

      const mockCreate = Task.create as jest.MockedFunction<typeof Task.create>
      mockCreate.mockResolvedValue(
        mockTask as unknown as Awaited<ReturnType<typeof Task.create>> as never
      )

      await createTask(req as Request, res as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED)
      expect(res.json).toHaveBeenCalled()
    })
  })

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const req = createAuthRequest() as Partial<Request>
      req.params = { id: 'task1' }
      req.body = { title: 'Updated Task' }
      const res = createMockResponse() as Partial<Response>

      const mockSave = jest.fn<() => Promise<ITask>>().mockResolvedValue({
        _id: { toString: () => 'task1' } as unknown as ITask['_id'],
        title: 'Updated Task'
      } as ITask)

      const mockTask: MockTaskDocument = {
        _id: { toString: () => 'task1' } as unknown as ITask['_id'],
        title: 'Updated Task',
        save: mockSave
      } as MockTaskDocument

      ;(Task.findOne as jest.MockedFunction<typeof Task.findOne>).mockResolvedValue(
        mockTask as ITask | null
      )

      await updateTask(req as Request, res as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
      expect(res.json).toHaveBeenCalled()
    })

    it('should return error if task not found', async () => {
      const req = createAuthRequest() as Partial<Request>
      req.params = { id: 'task1' }
      req.body = { title: 'Updated Task' }
      const res = createMockResponse() as Partial<Response>

      ;(Task.findOne as jest.MockedFunction<typeof Task.findOne>).mockResolvedValue(null)

      await updateTask(req as Request, res as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND)
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const req = createAuthRequest() as Partial<Request>
      req.params = { id: 'task1' }
      const res = createMockResponse() as Partial<Response>

      const mockTask: ITask = {
        _id: { toString: () => 'task1' } as unknown as ITask['_id']
      } as ITask

      ;(
        Task.findOneAndDelete as jest.MockedFunction<typeof Task.findOneAndDelete>
      ).mockResolvedValue(mockTask)

      await deleteTask(req as Request, res as Response)

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT)
    })
  })
})
