import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

export const getHealth = (_req: Request, res: Response): Response => {
  return sendSuccess(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
    'Server is healthy',
    HTTP_STATUS.OK
  );
};
