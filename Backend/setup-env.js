const fs = require('fs');
const path = require('path');

// Configuration
const MONGO_BASE = "mongodb+srv://shoaibkayani8_db_user:hJlO7NgMxcWTpxL7@cluster0.drpac5k.mongodb.net";
const COMMON_CONFIG = `
# Common Configuration
SECRET_KEY=Shoaib@99
FRONTEND_URL=http://localhost:5173
API_GATEWAY_URL=http://localhost:8000
KAFKA_BROKERS=localhost:9092
`;

const CLOUDINARY_CONFIG = `
# Cloudinary
CLOUD_NAME=dgprbbptn
API_SECRET=bwMfSePUdbgjJsShNRM6xmVvA-0
API_KEY=766248238421317
`;

// Service Definitions
const services = [
    {
        name: 'auth-service',
        port: 8001,
        db: 'fieldtech_auth',
        extra: `
${CLOUDINARY_CONFIG}
# Other Services
COMPANY_SERVICE_URL=http://localhost:8009
CLIENT_SERVICE_URL=http://localhost:8010
`
    },
    {
        name: 'company-service',
        port: 8009,
        db: 'fieldtech_company',
        extra: `
# Other Services
AUTH_SERVICE_URL=http://localhost:8001
`
    },
    {
        name: 'workorder-service',
        port: 8002,
        db: 'fieldtech_workorder',
        extra: `
${CLOUDINARY_CONFIG}
# Other Services
AUTH_SERVICE_URL=http://localhost:8001
CLIENT_SERVICE_URL=http://localhost:8010
APPLICATION_SERVICE_URL=http://localhost:8003
`
    },
    {
        name: 'review-service',
        port: 8011,
        db: 'fieldtech_review',
        extra: `
# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
`
    },
    {
        name: 'payment-service',
        port: 8005,
        db: 'fieldtech_payment',
        extra: `
# Stripe (Replace with your actual keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_APP_FEE_PERCENT=10

# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
`
    },
    {
        name: 'chat-service',
        port: 8006,
        db: 'fieldtech_chat',
        extra: `
# Other Services
AUTH_SERVICE_URL=http://localhost:8001
`
    },
    {
        name: 'notification-service',
        port: 8004,
        db: 'fieldtech_notification',
        extra: `
# Email (Replace with your credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
`
    },
    {
        name: 'client-service',
        port: 8010,
        db: 'fieldtech_client',
        extra: ``
    },
    {
        name: 'admin-service',
        port: 8008,
        db: 'fieldtech_admin',
        extra: `
# Other Services
AUTH_SERVICE_URL=http://localhost:8001
COMPANY_SERVICE_URL=http://localhost:8009
WORKORDER_SERVICE_URL=http://localhost:8002
PAYMENT_SERVICE_URL=http://localhost:8005
`
    },
    {
        name: 'application-service',
        port: 8003,
        db: 'fieldtech_application',
        extra: `
# Other Services
AUTH_SERVICE_URL=http://localhost:8001
WORKORDER_SERVICE_URL=http://localhost:8002
`
    },
    {
        name: 'search-service',
        port: 8012,
        db: 'fieldtech_search',
        extra: `
# Other Services
AUTH_SERVICE_URL=http://localhost:8001
COMPANY_SERVICE_URL=http://localhost:8009
WORKORDER_SERVICE_URL=http://localhost:8002
`
    }
];

console.log('🚀 Generating .env files...\n');

services.forEach(service => {
    const envContent = `
# Database
${service.db.toUpperCase().replace('FIELDTECH_', '')}_DB_URI=${MONGO_BASE}/${service.db}?retryWrites=true&w=majority

# Server
${service.name.toUpperCase().replace('-', '_')}_PORT=${service.port}

${COMMON_CONFIG}
${service.extra}
`.trim();

    const filePath = path.join(__dirname, 'services', service.name, '.env');

    try {
        fs.writeFileSync(filePath, envContent);
        console.log(`✅ Created .env for ${service.name}`);
    } catch (error) {
        console.error(`❌ Failed to create .env for ${service.name}:`, error.message);
    }
});

console.log('\n✨ All done! Next steps:');
console.log('1. Update Payment Service .env with real Stripe keys');
console.log('2. Update Notification Service .env with real SMTP credentials');
console.log('3. Start your services!');
