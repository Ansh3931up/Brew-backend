import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants.js';
import { ApiResponse } from '../types/api.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: Record<string, string[]>
): Response => {
  const response: ApiResponse = {
    success: false,
    error: message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};
