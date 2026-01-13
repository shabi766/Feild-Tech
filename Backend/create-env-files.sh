#!/bin/bash

# MongoDB Atlas Connection String
MONGO_BASE="mongodb+srv://shoaibkayani8_db_user:hJlO7NgMxcWTpxL7@cluster0.drpac5k.mongodb.net"

# Common Variables
SECRET_KEY="Shoaib@99"
FRONTEND_URL="http://localhost:5173"
API_GATEWAY_URL="http://localhost:8000"
KAFKA_BROKERS="localhost:9092"

# Cloudinary
CLOUD_NAME="dgprbbptn"
API_SECRET="bwMfSePUdbgjJsShNRM6xmVvA-0"
API_KEY="766248238421317"

echo "Creating .env files for all services..."

# 1. Auth Service
cat > services/auth-service/.env << EOF
# Database
AUTH_DB_URI=${MONGO_BASE}/fieldtech_auth?retryWrites=true&w=majority

# Server
AUTH_SERVICE_PORT=8001

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Cloudinary
CLOUD_NAME=${CLOUD_NAME}
API_SECRET=${API_SECRET}
API_KEY=${API_KEY}

# Other Services
COMPANY_SERVICE_URL=http://localhost:8009
CLIENT_SERVICE_URL=http://localhost:8010
EOF

# 2. Company Service
cat > services/company-service/.env << EOF
# Database
COMPANY_DB_URI=${MONGO_BASE}/fieldtech_company?retryWrites=true&w=majority

# Server
COMPANY_SERVICE_PORT=8009

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
EOF

# 3. Workorder Service
cat > services/workorder-service/.env << EOF
# Database
WORKORDER_DB_URI=${MONGO_BASE}/fieldtech_workorder?retryWrites=true&w=majority

# Server
WORKORDER_SERVICE_PORT=8002

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Cloudinary
CLOUD_NAME=${CLOUD_NAME}
API_SECRET=${API_SECRET}
API_KEY=${API_KEY}

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
CLIENT_SERVICE_URL=http://localhost:8010
APPLICATION_SERVICE_URL=http://localhost:8003
EOF

# 4. Review Service
cat > services/review-service/.env << EOF
# Database
REVIEW_DB_URI=${MONGO_BASE}/fieldtech_review?retryWrites=true&w=majority

# Server
REVIEW_SERVICE_PORT=8011

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
EOF

# 5. Payment Service
cat > services/payment-service/.env << EOF
# Database
PAYMENT_DB_URI=${MONGO_BASE}/fieldtech_payment?retryWrites=true&w=majority

# Server
PAYMENT_SERVICE_PORT=8005

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Stripe (add your keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_APP_FEE_PERCENT=10

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
EOF

# 6. Chat Service
cat > services/chat-service/.env << EOF
# Database
CHAT_DB_URI=${MONGO_BASE}/fieldtech_chat?retryWrites=true&w=majority

# Server
CHAT_SERVICE_PORT=8006

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
EOF

# 7. Notification Service
cat > services/notification-service/.env << EOF
# Database
NOTIFICATION_DB_URI=${MONGO_BASE}/fieldtech_notification?retryWrites=true&w=majority

# Server
NOTIFICATION_SERVICE_PORT=8004

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Email (add your SMTP details)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EOF

# 8. Client Service
cat > services/client-service/.env << EOF
# Database
CLIENT_DB_URI=${MONGO_BASE}/fieldtech_client?retryWrites=true&w=majority

# Server
CLIENT_SERVICE_PORT=8010

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}
EOF

# 9. Admin Service
cat > services/admin-service/.env << EOF
# Database
ADMIN_DB_URI=${MONGO_BASE}/fieldtech_admin?retryWrites=true&w=majority

# Server
ADMIN_SERVICE_PORT=8008

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
COMPANY_SERVICE_URL=http://localhost:8009
WORKORDER_SERVICE_URL=http://localhost:8002
PAYMENT_SERVICE_URL=http://localhost:8005
EOF

# 10. Application Service
cat > services/application-service/.env << EOF
# Database
APPLICATION_DB_URI=${MONGO_BASE}/fieldtech_application?retryWrites=true&w=majority

# Server
APPLICATION_SERVICE_PORT=8003

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
EOF

# 11. Search Service
cat > services/search-service/.env << EOF
# Database
SEARCH_DB_URI=${MONGO_BASE}/fieldtech_search?retryWrites=true&w=majority

# Server
SEARCH_SERVICE_PORT=8012

# JWT
SECRET_KEY=${SECRET_KEY}

# Frontend & API Gateway
FRONTEND_URL=${FRONTEND_URL}
API_GATEWAY_URL=${API_GATEWAY_URL}

# Kafka
KAFKA_BROKERS=${KAFKA_BROKERS}

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
COMPANY_SERVICE_URL=http://localhost:8009
WORKORDER_SERVICE_URL=http://localhost:8002
EOF

echo "✅ All .env files created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Review and update Stripe keys in services/payment-service/.env"
echo "2. Update SMTP credentials in services/notification-service/.env"
echo "3. Start services with: cd services/SERVICE_NAME && npm start"
