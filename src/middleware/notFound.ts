import { Request, Response } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { sendError } from '../utils/response.js';

export const notFoundHandler = (_req: Request, res: Response): Response => {
  return sendError(res, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
};
