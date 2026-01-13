# Application Service

Job application management microservice for ShiftMate. Handles job applications, application status updates, and applicant management.

## Features

- Apply for jobs/workorders
- View applied jobs
- Get applicants for a job (recruiter/admin view)
- Update application status
- Calendar view of applications
- Overlap checking for applications

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
   - Service URLs (Auth, Workorder)

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 8008 by default (configurable via `APPLICATION_SERVICE_PORT`).

## API Endpoints

### Application Endpoints

- `POST /api/v1/application/apply/:id` - Apply for a job
- `GET /api/v1/application/my-applications` - Get all jobs applied by current user
- `GET /api/v1/application/job/:id/applicants` - Get all applicants for a job
- `PUT /api/v1/application/:id/status` - Update application status
- `GET /api/v1/application/calendar` - Get applications for calendar view

### Health Check

- `GET /health` - Service health check

## Database

The Application Service uses the same MongoDB database as the main application.
Models store IDs only (no MongoDB refs) for cross-service references.

## Integration with Other Services

### Auth Service
- Fetches user/applicant data
- Verifies authentication tokens

### Workorder Service
- Fetches workorder/job data
- Updates workorder status when application is assigned

## Environment Variables

- `APPLICATION_SERVICE_PORT` - Port for the service (default: 8008)
- `MONGO_URI` - MongoDB connection string
- `AUTH_SERVICE_URL` - Auth Service URL (default: http://localhost:8001)
- `WORKORDER_SERVICE_URL` - Workorder Service URL (default: http://localhost:8002)
- `FRONTEND_URL` - Frontend URL for CORS
- `API_GATEWAY_URL` - API Gateway URL for CORS
- `SECRET_KEY` - JWT secret key (must match other services)
