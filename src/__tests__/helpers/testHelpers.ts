import { Request, Response } from 'express'
import type { IUser } from '../../models/User.js'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'

export const createMockRequest = (overrides?: Partial<Request>): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides
  } as Partial<Request>
}

export interface MockResponse extends Partial<Response> {
  status: jest.Mock<MockResponse, [number]>
  json: jest.Mock<MockResponse, [unknown]>
  send: jest.Mock<MockResponse, [unknown?]>
  cookie: jest.Mock<MockResponse, [string, string, unknown?]>
  clearCookie: jest.Mock<MockResponse, [string, unknown?]>
  redirect: jest.Mock<MockResponse, [string]>
}

export const createMockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis()
  }
  return res
}

export const createMockNext = () => jest.fn()

export interface MockUser extends Partial<IUser> {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
  comparePassword: jest.Mock<Promise<boolean>, [string]>
  generateToken: jest.Mock<string, []>
}

export const createMockUser = (overrides?: Partial<IUser>): MockUser => {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn().mockResolvedValue(true),
    generateToken: jest.fn().mockReturnValue('mock-token'),
    ...overrides
  }
}

export const createAuthRequest = (user?: IUser): Partial<Request> => {
  return createMockRequest({
    user: user || createMockUser()
  })
}
