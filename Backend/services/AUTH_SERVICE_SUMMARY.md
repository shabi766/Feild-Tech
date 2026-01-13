# Auth Service - Implementation Summary

## ✅ What Was Created

### Directory Structure

```
services/
├── auth-service/
│   ├── Controllers/
│   │   └── auth.controller.js       # All auth controllers (register, login, logout, password reset)
│   ├── Models/
│   │   └── user.model.js            # User model (extracted from main backend)
│   ├── Routes/
│   │   └── auth.route.js            # Auth routes
│   ├── middleware/
│   │   └── multer.js                # File upload middleware
│   ├── utils/
│   │   ├── db.js                    # Database connection
│   │   └── s3Upload.js              # S3 upload utility
│   ├── index.js                     # Express server entry point
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore rules
│   └── README.md                    # Service documentation
│
├── shared-middleware/
│   ├── index.js                     # Shared auth middleware for other services
│   ├── package.json                 # Package configuration
│   ├── README.md                    # Usage documentation
│   └── .gitignore                   # Git ignore rules
│
├── README.md                        # Microservices overview
└── MIGRATION_GUIDE.md              # Migration guide for Phase 1
```

## 🔑 Key Features

### Auth Service Endpoints

1. **POST /api/v1/auth/register** - User registration
2. **POST /api/v1/auth/login** - User login (returns JWT)
3. **GET /api/v1/auth/logout** - User logout
4. **POST /api/v1/auth/forgot-password** - Request password reset OTP
5. **POST /api/v1/auth/verify-otp** - Verify OTP
6. **POST /api/v1/auth/reset-password** - Reset password
7. **POST /api/v1/auth/verify** - Verify JWT token (for other services)
8. **GET /health** - Health check endpoint

### Shared Middleware

The shared middleware package allows other services to verify JWT tokens without needing direct access to the User model.

**Usage:**
```javascript
import createAuthMiddleware from '@shiftmate/shared-middleware';

// Basic usage (token verification only)
const isAuthenticated = createAuthMiddleware();

// Advanced usage (with User model access)
const isAuthenticated = createAuthMiddleware({
    getUserById: async (userId) => {
        return await User.findById(userId).select('-password');
    }
});
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd services/auth-service
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, AWS credentials, etc.
```

### 3. Start the Service

```bash
npm run dev  # Development mode
# or
npm start    # Production mode
```

The service will start on port **8001** (configurable via `AUTH_SERVICE_PORT`).

## 📋 Environment Variables Required

- `AUTH_SERVICE_PORT` - Port for the auth service (default: 8001)
- `MONGO_URI` - MongoDB connection string
- `SECRET_KEY` - JWT secret key (must match other services)
- `FRONTEND_URL` - Frontend URL for CORS
- `API_GATEWAY_URL` - API Gateway URL for CORS
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `EMAIL_USER` - Email address for sending OTPs
- `EMAIL_PASS` - Email app password

## 🔄 Integration Points

### With Frontend

Update frontend API calls to use:
```
http://localhost:8001/api/v1/auth/*
```

### With Other Services

Other services can:
1. Use the shared middleware package to verify tokens locally
2. Call `/api/v1/auth/verify` endpoint to verify tokens remotely
3. Use the same `SECRET_KEY` to verify tokens independently

## 📝 Next Steps

1. **Test the Auth Service**
   - Start the service
   - Test registration, login, logout flows
   - Verify token generation and validation

2. **Update Frontend**
   - Point authentication API calls to Auth Service
   - Test all auth flows in the frontend

3. **Set Up API Gateway** (Future)
   - Configure routing: `/api/v1/auth/*` → Auth Service
   - Update frontend to use API Gateway URL

4. **Migrate Other Services**
   - Workorder Service
   - Client/Project Service
   - Notification Service
   - Chat Service

## ⚠️ Important Notes

- The Auth Service uses the **same MongoDB database** as the main backend
- JWT tokens are **compatible** with the existing system
- All user data remains in the **same collection**
- The main backend still has auth routes - they can be removed after migration is complete
- All services must use the **same SECRET_KEY** for JWT verification

## 🐛 Troubleshooting

### Service won't start
- Check if port 8001 is available
- Verify MongoDB is running
- Check environment variables are set correctly

### Database connection fails
- Verify `MONGO_URI` is correct
- Ensure MongoDB is accessible
- Check network/firewall settings

### CORS errors
- Update `FRONTEND_URL` in `.env`
- Verify CORS configuration in `index.js`

### Token verification fails
- Ensure `SECRET_KEY` matches across all services
- Check token expiration (default: 7 days)
- Verify token format in Authorization header
