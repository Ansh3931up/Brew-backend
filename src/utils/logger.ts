import env from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  error: (message: string, error?: Error | unknown) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
