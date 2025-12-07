import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Authentication middleware
 * 
 * TODO: Implement actual JWT verification
 * For now, this is a placeholder that checks for Authorization header
 * 
 * To implement JWT:
 * 1. Install: npm install jsonwebtoken @types/jsonwebtoken
 * 2. Verify JWT token from Authorization header
 * 3. Attach user info to req.user
 */

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  // Extract token for future JWT verification
  // TODO: Verify JWT token
  // const token = authHeader.substring(7);
  // Example:
  // Example:
  // try {
  //   const decoded = jwt.verify(token, env.JWT_SECRET);
  //   req.user = decoded;
  //   next();
  // } catch (error) {
  //   return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  // }

  // Placeholder: For development, accept any token
  // Remove this in production!
  if (process.env.NODE_ENV === 'development') {
    req.user = {
      id: '1',
      email: 'user@example.com',
      role: 'user',
    };
    return next();
  }

  return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
};
