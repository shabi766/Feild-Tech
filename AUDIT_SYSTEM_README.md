# Comprehensive Audit Logging System

## Overview
This project now includes a comprehensive audit logging system that tracks all system activities, user actions, and administrative operations. The system provides real-time monitoring, suspicious activity detection, and detailed logging for compliance and security purposes.

## Features

### 🔍 **Automatic Logging**
- **Request/Response Logging**: All API requests and responses are automatically logged
- **User Activity Tracking**: Login, logout, CRUD operations, and system changes
- **Risk Level Assessment**: Automatic risk level determination based on action type and status
- **IP Address & User Agent**: Tracks client information for security analysis

### 📊 **Real-time Monitoring**
- **Live Statistics**: Total events, active users, high-risk events, failed actions
- **Suspicious Activity Detection**: Identifies and flags potentially risky operations
- **User Activity Summaries**: Detailed breakdown of user actions over time
- **Resource-level Tracking**: Monitor specific resources (users, projects, jobs, companies)

### 🛡️ **Security Features**
- **Admin-only Access**: Audit logs are restricted to authenticated administrators
- **Data Sanitization**: Sensitive information (passwords, tokens) is automatically filtered
- **Comprehensive Coverage**: Covers authentication, CRUD operations, financial transactions, and system changes

## Backend Implementation

### Models
- **`auditLog.model.js`**: Mongoose schema for audit log entries with automatic risk level determination

### Services
- **`auditService.js`**: High-level service for logging various event types and retrieving audit data

### Controllers
- **`audit.controller.js`**: API endpoints for fetching logs, statistics, and suspicious activities

### Routes
- **`audit.route.js`**: RESTful API endpoints (all protected by authentication and admin privileges)

### Middleware
- **`auditMiddleware.js`**: Automatic request/response logging with intelligent filtering and sanitization

## Frontend Implementation

### Components
- **`AuditLogs.jsx`**: Main component for viewing and interacting with audit logs
- **`useAuditLogs.js`**: Custom hook for data fetching and management

### Features
- **Advanced Filtering**: Filter by action, resource type, risk level, user, and date range
- **Interactive Table**: Sortable and paginated audit log display
- **Detail Views**: Click to view full log details including request/response data
- **Export Functionality**: Download audit logs as CSV for external analysis
- **Suspicious Activity Monitor**: Dedicated view for high-risk events

## API Endpoints

### Authentication Required
All endpoints require both authentication (`isAuthenticated`) and admin privileges (`isAdmin`).

```
GET  /api/v1/audit/logs              - Get audit logs with filtering and pagination
GET  /api/v1/audit/stats             - Get audit statistics (last 30 days)
GET  /api/v1/audit/suspicious        - Get suspicious activities (last 7 days)
GET  /api/v1/audit/user/:id/summary  - Get user activity summary
GET  /api/v1/audit/export            - Export audit logs to CSV
DELETE /api/v1/audit/cleanup         - Clean old audit logs
```

## Usage Examples

### Backend - Manual Logging
```javascript
import { AuditService } from '../utils/auditService.js';

// Log authentication events
await AuditService.logAuthEvent('LOGIN', userId, 'SUCCESS', { ipAddress: '192.168.1.1' });

// Log CRUD operations
await AuditService.logCRUDEvent('CREATE', 'user', userId, 'SUCCESS', { email: 'user@example.com' });

// Log suspicious activities
await AuditService.logSuspiciousActivity('MULTIPLE_FAILED_LOGINS', userId, 'HIGH', { attempts: 10 });
```

### Frontend - Using the Hook
```javascript
import useAuditLogs from '../hooks/useAuditLogs';

const { auditLogs, loading, fetchAuditLogs, exportAuditLogs } = useAuditLogs();

// Fetch logs with filters
await fetchAuditLogs({
  action: 'LOGIN',
  riskLevel: 'HIGH',
  startDate: '2024-01-01'
});

// Export logs
await exportAuditLogs({ action: 'DELETE' });
```

## Configuration

### System Settings
The audit logging system respects the `enableAuditLog` setting in system settings:
```javascript
// Backend/Models/systemSettings.model.js
security: {
  enableAuditLog: { type: Boolean, default: true }
}
```

### Risk Level Determination
Risk levels are automatically determined based on:
- **Critical**: System failures, security breaches, data corruption
- **High**: Failed authentication, suspicious patterns, admin actions
- **Medium**: Unusual activity, multiple failed attempts
- **Low**: Normal operations, successful actions

## Security Considerations

### Data Privacy
- Passwords and sensitive tokens are automatically sanitized
- Personal information is logged at appropriate levels
- Audit logs are only accessible to administrators

### Access Control
- All audit endpoints require admin authentication
- Session timeout and activity monitoring
- IP address tracking for security analysis

### Compliance
- Comprehensive logging for regulatory requirements
- Export functionality for external audits
- Long-term storage and cleanup policies

## Performance Optimization

### Database Indexing
The audit log model includes optimized indexes for:
- User ID and email queries
- Timestamp-based filtering
- Action and resource type searches
- Risk level filtering

### Automatic Cleanup
- Configurable retention policies
- Automatic cleanup of old logs
- Efficient pagination for large datasets

## Monitoring and Alerts

### Real-time Alerts
- High-risk activity notifications
- Suspicious pattern detection
- Failed authentication monitoring

### Dashboard Integration
- Audit statistics in admin dashboard
- Quick access to recent activities
- Risk level overview

## Troubleshooting

### Common Issues
1. **Logs not appearing**: Check if audit logging is enabled in system settings
2. **Permission denied**: Ensure user has admin role and is authenticated
3. **Performance issues**: Check database indexes and consider log cleanup

### Debug Mode
Enable debug logging in the audit middleware for troubleshooting:
```javascript
// Backend/middleware/auditMiddleware.js
const DEBUG_MODE = process.env.AUDIT_DEBUG === 'true';
```

## Future Enhancements

### Planned Features
- **Real-time WebSocket notifications** for critical events
- **Machine learning** for advanced threat detection
- **Integration with external SIEM systems**
- **Advanced analytics** and reporting
- **Custom alert rules** and thresholds

### Scalability
- **Distributed logging** for microservices
- **Log aggregation** and centralization
- **Performance monitoring** and optimization

## Support

For questions or issues with the audit logging system:
1. Check the system settings for audit logging configuration
2. Verify user permissions and authentication
3. Review the backend logs for any errors
4. Check database connectivity and indexes

---

**Note**: This audit logging system is designed for production use and includes comprehensive security measures. Always test thoroughly in development environments before deploying to production.
