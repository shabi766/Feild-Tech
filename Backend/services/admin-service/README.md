# Admin Service

Admin dashboard and system management microservice for ShiftMate platform.

## Overview

The Admin Service provides:
- **Dashboard Analytics**: Company and recruiter dashboard statistics
- **System Settings**: Global platform configuration management
- **Audit Logging**: Security and compliance audit trail management

## Port

Runs on port **8007** by default.

## Features

### Dashboard
- Company dashboard statistics (jobs, revenue, applications)
- Individual recruiter dashboard statistics (earnings, applicants, deadlines)

### System Settings
- General platform settings (name, description, timezone, maintenance mode)
- Security settings (session timeout, login attempts, 2FA, password requirements)
- Email configuration (SMTP settings)
- Payment settings (Stripe, PayPal, fees, withdrawal limits)
- Integration settings (Google Analytics, Facebook Pixel, webhooks)

### Audit Logging
- View audit logs with filtering and pagination
- Suspicious activity detection
- User activity summaries
- Audit statistics
- CSV export
- Automatic cleanup of old logs

## API Endpoints

### Dashboard
- `GET /api/v1/admin/dashboard/company/:companyId` - Get company dashboard stats
- `GET /api/v1/admin/dashboard/recruiter/:recruiterId` - Get recruiter dashboard stats

### System Settings
- `GET /api/v1/admin/system-settings` - Get all system settings
- `PUT /api/v1/admin/system-settings/:category` - Update settings by category
- `PUT /api/v1/admin/system-settings` - Update all settings
- `POST /api/v1/admin/system-settings/:category/reset` - Reset category to defaults

### Audit
- `GET /api/v1/admin/audit/logs` - Get audit logs (with filters)
- `GET /api/v1/admin/audit/suspicious` - Get suspicious activities
- `GET /api/v1/admin/audit/user/:userId/summary` - Get user activity summary
- `GET /api/v1/admin/audit/stats` - Get audit statistics
- `GET /api/v1/admin/audit/export` - Export audit logs as CSV
- `DELETE /api/v1/admin/audit/cleanup` - Clean old audit logs

## Authentication

All endpoints require:
1. **Authentication**: Valid JWT token (via `isAuthenticated` middleware)
2. **Authorization**: Admin role (via `isAdmin` middleware)

## Inter-Service Communication

The Admin Service communicates with:
- **Auth Service**: Fetch user data for dashboards and audit logs
- **Workorder Service**: Fetch job/workorder data for dashboard statistics
- **Client Service**: Fetch client and project data (future)
- **Payment Service**: Fetch transaction/revenue data (future)

## Models

### SystemSettings
- Single document storing all platform settings
- Categories: general, security, email, payment, integrations

### AuditLog
- Tracks all user and system actions
- Fields: userId, action, resourceType, status, riskLevel, isSuspicious
- No cross-service references (userId stored as ObjectId only)

### Company (Temporary)
- Temporary model for migration
- TODO: Replace with Company Service client when Company Service is created

### Application (Temporary)
- Temporary model for migration
- TODO: Replace with Application Service client when Application Service is created

## Environment Variables

See `.env.example` for required environment variables.

## Installation

```bash
cd services/admin-service
npm install
```

## Running

```bash
# Development
npm run dev

# Production
npm start
```

## Health Check

```bash
GET http://localhost:8007/health
```

## Migration Notes

- Company and Application models are temporary and will be replaced with service clients
- All cross-service model references have been removed
- User data is fetched via Auth Service HTTP calls
- Workorder data is fetched via Workorder Service HTTP calls

## Future Enhancements

- Replace temporary Company/Application models with service clients
- Add Application Service client when Application Service is created
- Add Payment Service client for revenue statistics
- Add real-time dashboard updates via WebSocket
- Add advanced analytics and reporting
