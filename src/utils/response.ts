import { Response } from 'express'
import { HTTP_STATUS } from './constants.js'
import { ApiResponse } from './ApiResponse.js'
import { ApiError } from './ApiError.js'

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const response = ApiResponse.success(data, message)
  return res.status(statusCode).json(response.toJSON())
}

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code?: string,
  errors?: Record<string, string[]>
): Response => {
  const response = ApiResponse.error(message, code, errors)
  return res.status(statusCode).json(response.toJSON())
}

export const sendApiError = (res: Response, error: ApiError): Response => {
  const response = ApiResponse.error(error.message, error.code, error.errors)
  return res.status(error.statusCode).json(response.toJSON())
}
