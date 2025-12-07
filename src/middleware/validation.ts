import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { sendError } from '../utils/response.js';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap: Record<string, string[]> = {};
      errors.array().forEach((error) => {
        if (error.type === 'field') {
          const field = error.path;
          if (!errorMap[field]) {
            errorMap[field] = [];
          }
          errorMap[field].push(error.msg);
        }
      });

      return sendError(res, ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, errorMap);
    }

    return next();
  };
};
