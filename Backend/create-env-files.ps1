# MongoDB Atlas Connection String
$MONGO_BASE = "mongodb+srv://shoaibkayani8_db_user:hJlO7NgMxcWTpxL7@cluster0.drpac5k.mongodb.net"

# Common Variables
$SECRET_KEY = "Shoaib@99"
$FRONTEND_URL = "http://localhost:5173"
$API_GATEWAY_URL = "http://localhost:8000"
$KAFKA_BROKERS = "localhost:9092"

# Cloudinary
$CLOUD_NAME = "dgprbbptn"
$API_SECRET = "bwMfSePUdbgjJsShNRM6xmVvA-0"
$API_KEY = "766248238421317"

Write-Host "Creating .env files for all services..." -ForegroundColor Green

# 1. Auth Service
@"
# Database
AUTH_DB_URI=$MONGO_BASE/fieldtech_auth?retryWrites=true&w=majority

# Server
AUTH_SERVICE_PORT=8001

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Cloudinary
CLOUD_NAME=$CLOUD_NAME
API_SECRET=$API_SECRET
API_KEY=$API_KEY

# Other Services
COMPANY_SERVICE_URL=http://localhost:8009
CLIENT_SERVICE_URL=http://localhost:8010
"@ | Out-File -FilePath "services\auth-service\.env" -Encoding UTF8

# 2. Company Service
@"
# Database
COMPANY_DB_URI=$MONGO_BASE/fieldtech_company?retryWrites=true&w=majority

# Server
COMPANY_SERVICE_PORT=8009

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
"@ | Out-File -FilePath "services\company-service\.env" -Encoding UTF8

# 3. Workorder Service
@"
# Database
WORKORDER_DB_URI=$MONGO_BASE/fieldtech_workorder?retryWrites=true&w=majority

# Server
WORKORDER_SERVICE_PORT=8002

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Cloudinary
CLOUD_NAME=$CLOUD_NAME
API_SECRET=$API_SECRET
API_KEY=$API_KEY

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
CLIENT_SERVICE_URL=http://localhost:8010
APPLICATION_SERVICE_URL=http://localhost:8003
"@ | Out-File -FilePath "services\workorder-service\.env" -Encoding UTF8

# 4. Review Service
@"
# Database
REVIEW_DB_URI=$MONGO_BASE/fieldtech_review?retryWrites=true&w=majority

# Server
REVIEW_SERVICE_PORT=8011

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
"@ | Out-File -FilePath "services\review-service\.env" -Encoding UTF8

# 5. Payment Service
@"
# Database
PAYMENT_DB_URI=$MONGO_BASE/fieldtech_payment?retryWrites=true&w=majority

# Server
PAYMENT_SERVICE_PORT=8005

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Stripe (add your keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_APP_FEE_PERCENT=10

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
"@ | Out-File -FilePath "services\payment-service\.env" -Encoding UTF8

# 6. Chat Service
@"
# Database
CHAT_DB_URI=$MONGO_BASE/fieldtech_chat?retryWrites=true&w=majority

# Server
CHAT_SERVICE_PORT=8006

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
"@ | Out-File -FilePath "services\chat-service\.env" -Encoding UTF8

# 7. Notification Service
@"
# Database
NOTIFICATION_DB_URI=$MONGO_BASE/fieldtech_notification?retryWrites=true&w=majority

# Server
NOTIFICATION_SERVICE_PORT=8004

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Email (add your SMTP details)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
"@ | Out-File -FilePath "services\notification-service\.env" -Encoding UTF8

# 8. Client Service
@"
# Database
CLIENT_DB_URI=$MONGO_BASE/fieldtech_client?retryWrites=true&w=majority

# Server
CLIENT_SERVICE_PORT=8010

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS
"@ | Out-File -FilePath "services\client-service\.env" -Encoding UTF8

# 9. Admin Service
@"
# Database
ADMIN_DB_URI=$MONGO_BASE/fieldtech_admin?retryWrites=true&w=majority

# Server
ADMIN_SERVICE_PORT=8008

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
COMPANY_SERVICE_URL=http://localhost:8009
WORKORDER_SERVICE_URL=http://localhost:8002
PAYMENT_SERVICE_URL=http://localhost:8005
"@ | Out-File -FilePath "services\admin-service\.env" -Encoding UTF8

# 10. Application Service
@"
# Database
APPLICATION_DB_URI=$MONGO_BASE/fieldtech_application?retryWrites=true&w=majority

# Server
APPLICATION_SERVICE_PORT=8003

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
"@ | Out-File -FilePath "services\application-service\.env" -Encoding UTF8

# 11. Search Service
@"
# Database
SEARCH_DB_URI=$MONGO_BASE/fieldtech_search?retryWrites=true&w=majority

# Server
SEARCH_SERVICE_PORT=8012

# JWT
SECRET_KEY=$SECRET_KEY

# Frontend & API Gateway
FRONTEND_URL=$FRONTEND_URL
API_GATEWAY_URL=$API_GATEWAY_URL

# Kafka
KAFKA_BROKERS=$KAFKA_BROKERS

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
COMPANY_SERVICE_URL=http://localhost:8009
WORKORDER_SERVICE_URL=http://localhost:8002
"@ | Out-File -FilePath "services\search-service\.env" -Encoding UTF8

Write-Host "`n✅ All .env files created successfully!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Review and update Stripe keys in services\payment-service\.env"
Write-Host "2. Update SMTP credentials in services\notification-service\.env"
Write-Host "3. Start services with: cd services\SERVICE_NAME && npm start"
