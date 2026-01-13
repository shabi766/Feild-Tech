# Client Service

Client and Project management microservice for ShiftMate. Handles client and project CRUD operations.

## Features

- Client registration and management
- Project registration and management
- Logo upload support for clients and projects
- Client-project relationship management
- Integration with Auth Service for user authentication

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
   - AWS S3 credentials (for logo uploads)

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 8003 by default (configurable via `CLIENT_SERVICE_PORT`).

## API Endpoints

### Client Endpoints

- `POST /api/v1/client/register` - Register a new client
- `GET /api/v1/client/get` - Get all clients for authenticated user
- `GET /api/v1/client/get/:id` - Get client by ID
- `PUT /api/v1/client/update/:id` - Update client

### Project Endpoints

- `POST /api/v1/project/register` - Register a new project
- `GET /api/v1/project/get` - Get all projects for authenticated user
- `GET /api/v1/project/get/:id` - Get project by ID
- `GET /api/v1/project/get-by-client/:clientId` - Get projects by client ID
- `PUT /api/v1/project/update/:id` - Update project

### Health Check

- `GET /health` - Service health check

## Database

The Client Service uses the same MongoDB database as the main application during migration.
The Client and Project models store IDs only (no MongoDB refs) for cross-service references.

## Model Structure

### Client Model
- Stores client-specific data (name, description, website, location, logo)
- `userId` stored as ID only (no ref to User model)

### Project Model
- Stores project-specific data (name, description, website, location, logo)
- `userId` stored as ID only (no ref to User model)
- `client` stored as ID only (no ref to Client model, but fetched within service)

## Integration with Other Services

### Auth Service
- Uses shared authentication middleware
- Fetches user ID from JWT token
- No direct User model access

### Workorder Service
- Workorder Service can fetch clients/projects via HTTP calls
- Replaces temporary `ClientDBHelper` with `ClientServiceClient`

## Migration Notes

- Socket.io notifications removed (will be added when Messaging Service is created)
- Project assignment notifications removed (will be added when Notification Service is created)
- All user data fetched via Auth Service JWT token
- No direct model imports from other services

## Environment Variables

See `.env.example` for all required environment variables.

## Troubleshooting

### Service won't start
- Check if port 8003 is available
- Verify MongoDB is running
- Check environment variables are set correctly

### Database connection fails
- Verify `MONGO_URI` is correct
- Ensure MongoDB is accessible
- Check network/firewall settings

### CORS errors
- Update `FRONTEND_URL` in `.env`
- Verify CORS configuration in `index.js`
