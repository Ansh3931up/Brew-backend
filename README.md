# 🚀 My App Server

Express backend server with TypeScript, security middleware, and a clean architecture.

## 📋 Features

- ✅ **Express.js** - Fast, unopinionated web framework
- ✅ **TypeScript** - Type-safe development
- ✅ **Security Middleware** - Helmet, CORS, rate limiting, XSS protection, NoSQL injection prevention
- ✅ **Clean Architecture** - Organized folder structure (controllers, routes, middleware, models, types, utils, config)
- ✅ **Environment Validation** - Zod schema validation for environment variables
- ✅ **Error Handling** - Centralized error handling middleware
- ✅ **Request Validation** - Express-validator for input validation
- ✅ **Logging** - Morgan for HTTP request logging
- ✅ **Compression** - Gzip compression for responses

## 📁 Project Structure

```
my-app-server/
├── src/
│   ├── config/              # Configuration files
│   │   ├── env.ts          # Environment variable validation
│   │   └── constants.ts    # App constants
│   ├── controllers/        # Request handlers
│   │   ├── healthController.ts
│   │   └── userController.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts        # Authentication middleware
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   ├── security.ts    # Security middleware
│   │   └── validation.ts  # Request validation
│   ├── models/            # Database models (add as needed)
│   ├── routes/            # Route definitions
│   │   ├── healthRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── index.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── api.d.ts
│   │   └── express.d.ts
│   ├── utils/            # Utility functions
│   │   ├── logger.ts
│   │   └── response.ts
│   └── server.ts         # Main server file
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `PORT` - Server port (default: 3001)
   - `CORS_ORIGIN` - Allowed CORS origins
   - `JWT_SECRET` - Secret key for JWT (must be at least 32 characters)
   - `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds
   - `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Start production server:**
   ```bash
   npm start
   ```

## 🔒 Security Features

### Implemented Security Middleware

1. **Helmet** - Sets various HTTP headers for security
2. **CORS** - Cross-Origin Resource Sharing configuration
3. **Rate Limiting** - Prevents abuse with request rate limiting
4. **XSS Protection** - XSS-clean middleware
5. **NoSQL Injection Prevention** - Express-mongo-sanitize
6. **HTTP Parameter Pollution** - HPP middleware
7. **Request Size Limits** - Body parser limits

## 📝 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users (Protected - requires authentication)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building

### Adding New Routes

1. Create a controller in `src/controllers/`
2. Create a route file in `src/routes/`
3. Import and add the route in `src/routes/index.ts`

Example:

```typescript
// src/controllers/exampleController.ts
export const getExample = (req: Request, res: Response) => {
  return sendSuccess(res, { message: 'Example' });
};

// src/routes/exampleRoutes.ts
import { Router } from 'express';
import { getExample } from '../controllers/exampleController.js';

const router = Router();
router.get('/', getExample);
export default router;

// src/routes/index.ts
import exampleRoutes from './exampleRoutes.js';
router.use('/example', exampleRoutes);
```

## 🔐 Authentication

The authentication middleware is currently a placeholder. To implement JWT authentication:

1. Install JWT library: `npm install jsonwebtoken @types/jsonwebtoken`
2. Update `src/middleware/auth.ts` with actual JWT verification
3. Create login/register endpoints in controllers

## 📦 Dependencies

### Production
- `express` - Web framework
- `cors` - CORS middleware
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `dotenv` - Environment variables
- `zod` - Schema validation
- `compression` - Response compression
- `morgan` - HTTP logger
- `cookie-parser` - Cookie parsing
- `express-mongo-sanitize` - NoSQL injection prevention
- `hpp` - HTTP parameter pollution prevention
- `xss-clean` - XSS protection

### Development
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution
- `@types/*` - TypeScript type definitions
- `eslint` - Linting
- `@typescript-eslint/*` - TypeScript ESLint plugins

## 🚢 Deployment

1. Build the project: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

For production, consider:
- Using PM2 or similar process manager
- Setting up reverse proxy (nginx)
- Enabling HTTPS
- Database connection pooling
- Monitoring and logging services

## 📚 Best Practices

- ✅ Type safety with TypeScript
- ✅ Environment variable validation
- ✅ Centralized error handling
- ✅ Request validation
- ✅ Security middleware
- ✅ Structured logging
- ✅ Clean code organization

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## 📄 License

ISC
# Brew-backend
