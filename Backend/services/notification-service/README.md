# Notification Service

Notification management microservice for ShiftMate. Handles system alerts, status updates, and user notifications.

## Features

- User notification management
- Job-related notifications (application, assignment, creation)
- Project-related notifications (creation, assignment)
- Client-related notifications (creation)
- Notification status tracking (read/unread)
- Integration with Auth, Workorder, and Client services

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
   - Service URLs (Auth, Workorder, Client)

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 8004 by default (configurable via `NOTIFICATION_SERVICE_PORT`).

## API Endpoints

### Notification Management

- `GET /api/v1/notification` - Get all notifications for authenticated user
- `PATCH /api/v1/notification/:id/read` - Mark notification as read
- `DELETE /api/v1/notification/clear` - Clear all notifications for user

### Send Notifications

- `POST /api/v1/notification/send` - Send job application notification
- `POST /api/v1/notification/Job-create` - Send job created notification
- `POST /api/v1/notification/Project-create` - Send project created notification
- `POST /api/v1/notification/client-create` - Send client creation notification
- `POST /api/v1/notification/job-assigned` - Send job assigned notification

### Health Check

- `GET /health` - Service health check

## Database

The Notification Service uses the same MongoDB database as the main application during migration.
The Notification model stores IDs only (no MongoDB refs) for cross-service references.

## Model Structure

The Notification model stores:
- Notification-specific data (type, message, status, timestamp)
- IDs for related entities (sender, recipient, job, project, client)
- No direct references to other services' models

## Integration with Other Services

### Auth Service
- Fetches user data for sender and recipient
- Uses `AuthServiceClient` for HTTP calls

### Workorder Service
- Fetches job data for job-related notifications
- Uses `WorkorderServiceClient` for HTTP calls

### Client Service
- Fetches client and project data
- Uses `ClientServiceClient` for HTTP calls

## Migration Notes

- All user data fetched via Auth Service HTTP calls
- All job data fetched via Workorder Service HTTP calls
- All client/project data fetched via Client Service HTTP calls
- No direct model imports from other services
- Notification creation helpers updated to work with service clients

## Environment Variables

See `.env.example` for all required environment variables.

## Troubleshooting

### Service won't start
- Check if port 8004 is available
- Verify MongoDB is running
- Check environment variables are set correctly

### Service communication fails
- Verify service URLs are correct (AUTH_SERVICE_URL, WORKORDER_SERVICE_URL, CLIENT_SERVICE_URL)
- Ensure other services are running
- Check network connectivity

### Database connection fails
- Verify `MONGO_URI` is correct
- Ensure MongoDB is accessible
- Check network/firewall settings
