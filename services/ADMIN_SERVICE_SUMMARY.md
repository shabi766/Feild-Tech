# Admin Dashboard Service Summary

## Overview

The Admin Dashboard Service (Phase 7) provides comprehensive administrative functionality for the ShiftMate platform, including dashboard analytics, system settings management, and audit logging.

## Service Details

- **Port:** 8007
- **Status:** ✅ Complete
- **Base Path:** `/api/v1/admin`

## Features

### 1. Dashboard Analytics
- **Company Dashboard Stats**
  - Total jobs, active jobs, completed jobs
  - Total revenue from completed jobs
  - Pending applications
  - Active projects
  - Project success rate
  - Recent jobs and projects

- **Individual Recruiter Dashboard Stats**
  - Total jobs posted
  - Total earnings and pending payments
  - Total applicants
  - Upcoming deadlines
  - Recent jobs and applicants

### 2. System Settings Management
- **General Settings**: Platform name, description, timezone, date format, language, maintenance mode
- **Security Settings**: Session timeout, max login attempts, 2FA requirement, password requirements, audit logging, IP whitelist
- **Email Settings**: SMTP configuration (host, port, user, password, SSL)
- **Payment Settings**: Stripe/PayPal enablement, default currency, transaction fees, withdrawal limits
- **Integration Settings**: Google Analytics, Facebook Pixel, Slack webhook, API rate limits

### 3. Audit Logging
- **View Audit Logs**: Filterable and paginated audit log viewing
- **Suspicious Activities**: Detection and reporting of suspicious activities
- **User Activity Summary**: Activity history for specific users
- **Audit Statistics**: Aggregated statistics by action, risk level, status, user role
- **CSV Export**: Export audit logs for compliance and analysis
- **Automatic Cleanup**: Remove old audit logs (respecting compliance requirements)

## API Endpoints

### Dashboard
```
GET /api/v1/admin/dashboard/company/:companyId
GET /api/v1/admin/dashboard/recruiter/:recruiterId
```

### System Settings
```
GET /api/v1/admin/system-settings
PUT /api/v1/admin/system-settings/:category
PUT /api/v1/admin/system-settings
POST /api/v1/admin/system-settings/:category/reset
```

### Audit
```
GET /api/v1/admin/audit/logs
GET /api/v1/admin/audit/suspicious
GET /api/v1/admin/audit/user/:userId/summary
GET /api/v1/admin/audit/stats
GET /api/v1/admin/audit/export
DELETE /api/v1/admin/audit/cleanup
```

## Authentication & Authorization

All endpoints require:
1. **Authentication**: Valid JWT token (via `isAuthenticated` middleware)
2. **Authorization**: Admin role (via `isAdmin` middleware)

## Models

### SystemSettings
- Single document storing all platform settings
- Categories: `general`, `security`, `email`, `payment`, `integrations`
- Ensures only one settings document exists
- Masks sensitive information (e.g., SMTP password) in responses

### AuditLog
- Tracks all user and system actions
- Fields: `userId`, `userEmail`, `userRole`, `action`, `resourceType`, `status`, `riskLevel`, `isSuspicious`
- No cross-service references (userId stored as ObjectId only)
- Indexed for efficient querying
- Automatic risk level assignment based on action type

### Company (Temporary)
- Temporary model for migration period
- TODO: Replace with Company Service client when Company Service is created

### Application (Temporary)
- Temporary model for migration period
- TODO: Replace with Application Service client when Application Service is created

## Inter-Service Communication

The Admin Service communicates with:

### Auth Service
- **Purpose**: Fetch user data for dashboards and audit logs
- **Endpoints Used**:
  - `GET /api/v1/auth/users/:userId` - Get single user
  - `POST /api/v1/auth/users/batch` - Get multiple users

### Workorder Service
- **Purpose**: Fetch job/workorder data for dashboard statistics
- **Endpoints Used**:
  - `GET /api/v1/workorder/get` - Get workorders with filters

### Client Service
- **Purpose**: Fetch client and project data (future enhancement)
- **Endpoints Used**:
  - `GET /api/v1/client/get/:clientId` - Get single client
  - `GET /api/v1/client/get` - Get all clients

## Architecture Decisions

### Clean Microservice Boundaries
- No direct database access to other services' models
- All cross-service data fetched via HTTP clients
- Models store only ObjectIds, not references

### Temporary Models
- Company and Application models are temporary during migration
- Will be replaced with service clients when respective services are created
- Allows Admin Service to function independently during migration

### Audit Log Enrichment
- Audit logs enriched with user data from Auth Service when available
- Falls back gracefully if Auth Service is unavailable
- User data added to response, not stored in audit log

### Security
- All endpoints protected by authentication and admin authorization
- Sensitive settings (e.g., SMTP password) masked in responses
- Audit logs track all administrative actions

## Environment Variables

```env
ADMIN_SERVICE_PORT=8007
MONGO_URI=mongodb://localhost:27017/alpha_project
FRONTEND_URL=http://localhost:5173
API_GATEWAY_URL=http://localhost:8000
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
CLIENT_SERVICE_URL=http://localhost:8003
PAYMENT_SERVICE_URL=http://localhost:8006
JWT_SECRET=your_jwt_secret_here
```

## Installation & Running

```bash
cd services/admin-service
npm install
npm run dev  # Development
npm start    # Production
```

## Health Check

```bash
GET http://localhost:8007/health
```

Response:
```json
{
  "status": "healthy",
  "service": "admin-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Migration Notes

1. **Temporary Models**: Company and Application models will be replaced with service clients
2. **Cross-Service References**: All removed from models
3. **User Data**: Fetched via Auth Service HTTP calls
4. **Job Data**: Fetched via Workorder Service HTTP calls

## Future Enhancements

- Replace temporary Company/Application models with service clients
- Add Application Service client when Application Service is created
- Add Payment Service client for revenue statistics
- Add real-time dashboard updates via WebSocket
- Add advanced analytics and reporting
- Add system monitoring and alerting
- Add automated compliance reporting

## Related Documentation

- `services/admin-service/README.md` - Detailed service documentation
- `services/MIGRATION_STATUS.md` - Overall migration status
