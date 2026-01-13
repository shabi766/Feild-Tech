# Review Service

Review and rating microservice for ShiftMate. Handles reviews, ratings, and review statistics for technicians.

## Features

- Create reviews for completed jobs
- Get reviews for technicians
- Get review statistics
- Update reviews
- Delete reviews
- Automatic rating statistics updates
- Integration with Leaderboard Service

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
   - Service URLs (Auth, Workorder, Leaderboard)

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 8011 by default (configurable via `REVIEW_SERVICE_PORT`).

## API Endpoints

### Review Endpoints

- `POST /api/v1/review` - Create a new review
- `GET /api/v1/review/technician/:technicianId` - Get reviews for a technician
- `GET /api/v1/review/technician/:technicianId/stats` - Get review statistics for a technician
- `PUT /api/v1/review/:reviewId` - Update a review
- `DELETE /api/v1/review/:reviewId` - Delete a review

### Health Check

- `GET /health` - Service health check

## Database

The Review Service uses the same MongoDB database as the main application.
Models store IDs only (no MongoDB refs) for cross-service references.

## Integration with Other Services

### Auth Service
- Fetches user/technician/reviewer data
- Updates user rating statistics

### Workorder Service
- Fetches workorder/job data
- Validates job completion status

### Leaderboard Service
- Notifies leaderboard service when reviews are created/updated
- Updates technician rankings

## Environment Variables

- `REVIEW_SERVICE_PORT` - Port for the service (default: 8011)
- `MONGO_URI` - MongoDB connection string
- `AUTH_SERVICE_URL` - Auth Service URL (default: http://localhost:8001)
- `WORKORDER_SERVICE_URL` - Workorder Service URL (default: http://localhost:8002)
- `LEADERBOARD_SERVICE_URL` - Leaderboard Service URL (default: http://localhost:8010)
- `FRONTEND_URL` - Frontend URL for CORS
- `API_GATEWAY_URL` - API Gateway URL for CORS
- `SECRET_KEY` - JWT secret key (must match other services)
