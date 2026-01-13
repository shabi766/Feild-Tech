# ShiftMate Microservices

This directory contains the microservices architecture for ShiftMate.

## Services

### Auth Service (`auth-service/`)

Handles all authentication-related functionality:
- User registration
- User login/logout
- Password reset
- JWT token management

**Port:** 8001 (default)

### Workorder Service (`workorder-service/`)

Handles job/workorder management:
- Job creation and management
- Job status tracking
- Check-in/check-out functionality
- Salary calculation

**Port:** 8002 (default)

### Client Service (`client-service/`)

Handles client and project management:
- Client registration and management
- Project registration and management
- Client-project relationships

**Port:** 8003 (default)

### Notification Service (`notification-service/`)

Handles system notifications and alerts:
- User notification management
- Job-related notifications
- Project and client notifications
- Notification status tracking

**Port:** 8004 (default)

### Chat Service (`chat-service/`)

Handles real-time messaging and communication:
- Real-time messaging via Socket.io
- One-on-one and group chats
- File uploads and sharing
- Audio call signaling (WebRTC)
- User presence (online/offline)

**Port:** 8005 (default)

### Shared Middleware (`shared-middleware/`)

Shared authentication middleware package that can be used by all microservices to verify JWT tokens.

### Shared Clients (`shared-clients/`)

HTTP clients for inter-service communication:
- `auth-client.service.js` - Client for Auth Service
- `client-client.service.js` - Client for Client Service
- `notification-client.service.js` - Client for Notification Service
- `chat-client.service.js` - Client for Chat Service (if needed)

## Architecture Overview

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │ (Future)
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│ Auth Service│  │Other Services│
└─────────────┘  └─────────────┘
```

## Getting Started

### 1. Start Auth Service

```bash
cd services/auth-service
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 2. Using Shared Middleware

Install the shared middleware in your service:

```bash
cd services/your-service
npm install ../shared-middleware
```

Then use it:

```javascript
import createAuthMiddleware from '@shiftmate/shared-middleware';

const isAuthenticated = createAuthMiddleware();
app.use('/api/protected', isAuthenticated, yourRoute);
```

## Migration Strategy

We're migrating from a monolithic backend to microservices step by step:

1. ✅ **Phase 1**: Extract Auth Service
2. ✅ **Phase 2**: Extract Workorder/Job Service
3. ✅ **Phase 3**: Extract Client/Project Service
4. ✅ **Phase 4**: Extract Notification Service
5. ✅ **Phase 5**: Extract Chat Service

## Development Notes

- Each service runs on its own port
- Services share the same MongoDB database (for now)
- All services use the same JWT `SECRET_KEY` for token verification
- CORS is configured to allow requests from frontend and API gateway
