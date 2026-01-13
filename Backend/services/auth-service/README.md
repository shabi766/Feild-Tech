# Auth Service

Authentication microservice for ShiftMate. Handles user registration, login, logout, and password reset functionality.

## Features

- User registration with role-based access
- User login with JWT token generation
- User logout
- Password reset via OTP email
- Token verification endpoint for other services
- Profile photo upload support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secret key (must match other services)
   - AWS S3 credentials (for file uploads)
   - Email credentials (for password reset)

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 8001 by default (configurable via `AUTH_SERVICE_PORT`).

## API Endpoints

### Public Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset OTP
- `POST /api/v1/auth/verify-otp` - Verify password reset OTP
- `POST /api/v1/auth/reset-password` - Reset password with OTP

### Service-to-Service Endpoints

- `POST /api/v1/auth/verify` - Verify JWT token (for other services)

### Health Check

- `GET /health` - Service health check

## Database

The Auth Service uses the same MongoDB database as the main application. The User model is stored in the `users` collection.

## Integration with Other Services

Other services can verify tokens by:
1. Using the shared middleware package (`@shiftmate/shared-middleware`)
2. Calling the `/api/v1/auth/verify` endpoint
3. Verifying tokens locally using the shared `SECRET_KEY`

## Environment Variables

See `.env.example` for all required environment variables.
