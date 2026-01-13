# Environment Configuration Setup Guide

## Quick Start

### 1. Copy Example Files
For each service, copy `.env.example` to `.env`:

```bash
# Auth Service
cd services/auth-service
cp .env.example .env

# Company Service
cd ../company-service
cp .env.example .env

# Repeat for all services...
```

Or use this script to copy all at once:
```bash
# PowerShell
Get-ChildItem -Path "services" -Directory | ForEach-Object {
    $envExample = Join-Path $_.FullName ".env.example"
    $env = Join-Path $_.FullName ".env"
    if (Test-Path $envExample) {
        Copy-Item $envExample $env
        Write-Host "Created .env for $($_.Name)"
    }
}
```

### 2. Update Values
Edit each `.env` file and replace placeholder values:
- Change `SECRET_KEY` to a strong random string
- Update database URIs if not using defaults
- Add your Stripe keys (payment-service)
- Add your email credentials (notification-service, auth-service)
- Add AWS credentials if using S3

### 3. Add to .gitignore
Ensure `.env` files are NOT committed:

```gitignore
# Environment files
.env
.env.local
.env.*.local
```

Keep `.env.example` files committed for reference.

## Service-Specific Notes

### Auth Service
- **SECRET_KEY**: Used for JWT token generation (MUST be same across all services)
- **SMTP**: Required for password reset emails
- **AWS S3**: Optional, for profile photo uploads

### Company Service
- **AWS S3**: For company logo uploads
- Needs access to Auth Service for user validation

### Workorder Service
- Communicates with multiple services (Auth, Company, Client, Payment)
- **AWS S3**: For job attachment uploads

### Payment Service
- **STRIPE_SECRET_KEY**: Get from Stripe Dashboard
- **STRIPE_WEBHOOK_SECRET**: For webhook verification
- Critical: Never commit real Stripe keys

### Notification Service
- **SMTP**: For email notifications
- **Twilio**: For SMS notifications (optional)
- **Firebase**: For push notifications (optional)

### Search Service
- No database needed (or minimal for caching)
- Only needs URLs to other services

## Security Best Practices

### 1. Secret Key Generation
Generate strong SECRET_KEY:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use online generator (for development only)
```

### 2. Different Keys Per Environment
- **Development**: Can use simple keys
- **Staging**: Use different keys than production
- **Production**: Use strong, unique keys

### 3. Environment Variables Priority
Services check in this order:
1. Service-specific env var (e.g., `AUTH_DB_URI`)
2. Generic `MONGO_URI`
3. Default hardcoded value

### 4. Never Commit Secrets
- Add `.env` to `.gitignore`
- Use `.env.example` for documentation
- Use secret management tools in production (AWS Secrets Manager, HashiCorp Vault)

## Production Deployment

### Docker
```dockerfile
# Don't copy .env in Dockerfile
# Use docker-compose or pass env vars at runtime
```

### Docker Compose
```yaml
services:
  auth-service:
    env_file:
      - ./services/auth-service/.env
```

### Kubernetes
Use ConfigMaps and Secrets:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-service-secrets
data:
  SECRET_KEY: <base64-encoded-value>
```

### Cloud Platforms
- **Heroku**: Use Config Vars
- **AWS**: Use Parameter Store or Secrets Manager
- **Azure**: Use Key Vault
- **Google Cloud**: Use Secret Manager

## Common Issues

### Issue: Services can't connect to each other
**Solution**: Check service URLs are correct and services are running

### Issue: Database connection failed
**Solution**: 
- Ensure MongoDB is running
- Check database URI format
- Verify network connectivity

### Issue: JWT token invalid across services
**Solution**: Ensure `SECRET_KEY` is IDENTICAL in all services

### Issue: Stripe webhooks failing
**Solution**: 
- Use Stripe CLI for local testing
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

## Verification

Test configuration:
```bash
# Start a service
cd services/auth-service
npm start

# Check logs for:
# ✅ Auth Service: MongoDB connected successfully
# ⭐ Auth Service running at port 8001
```

## Environment Variables Reference

| Variable | Required | Services | Purpose |
|----------|----------|----------|---------|
| `SECRET_KEY` | ✅ | All | JWT signing |
| `*_DB_URI` | ✅ | All (except Search) | Database connection |
| `*_SERVICE_PORT` | ✅ | All | Service port |
| `FRONTEND_URL` | ✅ | All | CORS configuration |
| `STRIPE_SECRET_KEY` | ✅ | Payment | Payment processing |
| `SMTP_*` | ⚠️ | Auth, Notification, Admin | Email sending |
| `AWS_*` | ⚠️ | Auth, Company, Workorder | File uploads |
| `TWILIO_*` | ❌ | Notification | SMS (optional) |
| `FIREBASE_*` | ❌ | Notification | Push notifications (optional) |

✅ Required | ⚠️ Required for feature | ❌ Optional
