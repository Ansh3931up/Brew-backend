export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
} as const;
