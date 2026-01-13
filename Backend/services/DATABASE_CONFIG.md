# Database Configuration - Environment Variables

## Overview
Each microservice now uses its own dedicated MongoDB database for complete data isolation.

## Database Naming Convention
`fieldtech_<service-name>`

## Environment Variables

### Option 1: Service-Specific Variables (Recommended)
```env
# Auth Service
AUTH_DB_URI=mongodb://localhost:27017/fieldtech_auth

# Company Service
COMPANY_DB_URI=mongodb://localhost:27017/fieldtech_company

# Workorder Service
WORKORDER_DB_URI=mongodb://localhost:27017/fieldtech_workorder

# Review Service
REVIEW_DB_URI=mongodb://localhost:27017/fieldtech_review

# Payment Service
PAYMENT_DB_URI=mongodb://localhost:27017/fieldtech_payment

# Chat Service
CHAT_DB_URI=mongodb://localhost:27017/fieldtech_chat

# Notification Service
NOTIFICATION_DB_URI=mongodb://localhost:27017/fieldtech_notification

# Client Service
CLIENT_DB_URI=mongodb://localhost:27017/fieldtech_client

# Admin Service
ADMIN_DB_URI=mongodb://localhost:27017/fieldtech_admin

# Application Service
APPLICATION_DB_URI=mongodb://localhost:27017/fieldtech_application
```

### Option 2: Generic MONGO_URI (Fallback)
If you don't set service-specific variables, each service will use its default database name:
```env
# This will be ignored if service-specific URI is set
MONGO_URI=mongodb://localhost:27017/fieldtech_auth
```

## Production Configuration

### MongoDB Atlas (Cloud)
```env
AUTH_DB_URI=mongodb+srv://username:password@cluster.mongodb.net/fieldtech_auth?retryWrites=true&w=majority
COMPANY_DB_URI=mongodb+srv://username:password@cluster.mongodb.net/fieldtech_company?retryWrites=true&w=majority
# ... etc for each service
```

### Self-Hosted MongoDB
```env
AUTH_DB_URI=mongodb://username:password@your-mongo-host:27017/fieldtech_auth?authSource=admin
COMPANY_DB_URI=mongodb://username:password@your-mongo-host:27017/fieldtech_company?authSource=admin
# ... etc for each service
```

## Database List
After starting all services, you should see these databases in MongoDB:

1. `fieldtech_auth` - User authentication data
2. `fieldtech_company` - Company, roles, teams data
3. `fieldtech_workorder` - Jobs and projects
4. `fieldtech_review` - Reviews, leaderboard, testimonials
5. `fieldtech_payment` - Transactions and wallets
6. `fieldtech_chat` - Conversations and messages
7. `fieldtech_notification` - Notification records
8. `fieldtech_client` - Client information
9. `fieldtech_admin` - System settings and audit logs
10. `fieldtech_application` - Job applications

## Verification

Check databases exist:
```bash
# MongoDB Shell
mongosh
> show dbs

# Or using mongo command
mongo --eval "db.adminCommand('listDatabases')"
```

## Notes
- Each service will automatically create its database on first connection
- No manual database creation needed
- Old `alpha_project` database can be archived/deleted after migration
