# Workorder Service

Workorder/Job management microservice for ShiftMate. Handles job posting, assignment, status updates, and work order management.

## Features

- Job/workorder creation and management
- Job status tracking (Draft, Active, Assigned, In Progress, Done, Complete, Review, Cancel, Paid)
- Check-in/check-out functionality
- Salary calculation based on job type
- File uploads (attachments, images, shipments)
- Custom fields, tasks, and audit rules
- Integration with Auth Service for user data
- Integration with Client Service for client/project data

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
   - Auth Service URL
   - AWS S3 credentials (for file uploads)

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 8002 by default (configurable via `WORKORDER_SERVICE_PORT`).

## API Endpoints

### Job Management

- `POST /api/v1/workorder/post` - Create a new job/workorder
- `GET /api/v1/workorder/get` - Get all jobs (with optional keyword search)
- `GET /api/v1/workorder/get/:id` - Get job by ID
- `GET /api/v1/workorder/getadminjobs` - Get jobs created by admin
- `PUT /api/v1/workorder/update/:id` - Update job
- `PUT /api/v1/workorder/status/:id` - Update job status

### Job Status Operations

- `PUT /api/v1/workorder/checkin/:id` - Check in to job
- `PUT /api/v1/workorder/checkout/:id` - Check out from job
- `PUT /api/v1/workorder/done/:id` - Mark job as done
- `PUT /api/v1/workorder/complete/:id` - Mark job as complete
- `PUT /api/v1/workorder/review/:id` - Mark job for review
- `PUT /api/v1/workorder/paid/:id` - Mark job as paid
- `PUT /api/v1/workorder/Cancel/:id` - Cancel job

### Job Queries

- `GET /api/v1/workorder/get-by-project/:projectId` - Get jobs by project
- `GET /api/v1/workorder/technician-jobs` - Get technician's jobs (applied, assigned, in progress, done, completed)
- `GET /api/v1/workorder/workorders/draft/:id` - Get draft job by ID

### File Operations

- `POST /api/v1/workorder/upload-images/:jobId` - Upload work order images

### Health Check

- `GET /health` - Service health check

## Integration with Other Services

### Auth Service

The Workorder Service fetches user/technician data from the Auth Service:
- User details for `created_by`, `assignedApplicant`
- Uses `AuthServiceClient` for HTTP calls

### Client Service (Future)

Currently uses `ClientDBHelper` for direct database access during migration.
Once Client Service is created, this will be replaced with `ClientServiceClient`.

## Database

The Workorder Service uses the same MongoDB database as the main application during migration.
The Workorder model stores IDs only (no MongoDB refs) for cross-service references.

## Model Structure

The Workorder model stores:
- Workorder-specific data (title, description, skills, etc.)
- IDs for related entities (clientName, projectName, created_by, assignedApplicant)
- No direct references to other services' models

## Migration Notes

- Uses `ClientDBHelper` temporarily for Client/Project queries
- Will migrate to `ClientServiceClient` once Client Service is created
- All user data fetched via Auth Service HTTP calls
- No direct model imports from other services

## Environment Variables

See `.env.example` for all required environment variables.

## Troubleshooting

### Service won't start
- Check if port 8002 is available
- Verify MongoDB is running
- Check environment variables are set correctly

### Auth Service connection fails
- Verify `AUTH_SERVICE_URL` is correct
- Ensure Auth Service is running
- Check network connectivity

### Database connection fails
- Verify `MONGO_URI` is correct
- Ensure MongoDB is accessible
- Check network/firewall settings
