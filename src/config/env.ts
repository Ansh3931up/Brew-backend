import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default('development-secret-key-change-in-production-min-32-chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
  
  // Warn if using default JWT_SECRET in production
  if (
    env.NODE_ENV === 'production' &&
    env.JWT_SECRET === 'development-secret-key-change-in-production-min-32-chars'
  ) {
    console.warn(
      '⚠️  WARNING: Using default JWT_SECRET in production! Set a secure JWT_SECRET in your environment variables.'
    );
  }
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export default env;
