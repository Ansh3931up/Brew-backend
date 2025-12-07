import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import env from '../config/env.js';

export const errorHandler = (
  err: Error | unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  logger.error('Error occurred:', err);

  // Validation errors
  if (err instanceof Error && err.name === 'ValidationError') {
    return sendError(res, ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
  }

  // Default error
  const message =
    env.NODE_ENV === 'production'
      ? ERROR_MESSAGES.INTERNAL_ERROR
      : err instanceof Error
      ? err.message
      : ERROR_MESSAGES.INTERNAL_ERROR;

  return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
