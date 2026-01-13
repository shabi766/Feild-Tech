# Kafka Integration - Quick Start Guide

## ✅ Kafka is Running!

Your Kafka infrastructure is now active:
- **Zookeeper**: Running on port 2181
- **Kafka Broker**: Running on port 9092
- **Kafka UI**: http://localhost:8080

## Test the Integration

### 1. Start Auth Service
```powershell
cd services/auth-service
npm start
```

### 2. Start Notification Service (in new terminal)
```powershell
cd services/notification-service
npm start
```

### 3. Test User Registration
```powershell
curl -X POST http://localhost:8001/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "fullname": "Test User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "password": "password123",
    "cnic": "12345-1234567-1",
    "role": "Technician"
  }'
```

### Expected Flow:
1. ✅ User registered in Auth Service
2. 📤 `user.created` event published to Kafka
3. 📨 Notification Service receives event
4. 📧 Welcome email sent

### Check Logs:

**Auth Service should show:**
```
✅ Published user.created event for: test@example.com
```

**Notification Service should show:**
```
📨 Received event from user.created
📧 Processing user.created event: test@example.com
✅ Welcome email sent to: test@example.com
```

### Monitor with Kafka UI:
1. Open http://localhost:8080
2. Click on "Topics"
3. Find `user.created` topic
4. View messages

## Troubleshooting

### Kafka not accessible
```powershell
# Check if containers are running
docker ps

# Check Kafka logs
docker logs fieldtech-kafka

# Restart Kafka
docker-compose -f docker-compose.kafka.yml restart
```

### Services can't connect to Kafka
Make sure `KAFKA_BROKERS=localhost:9092` is in your `.env` files (it's already set by default).

## Stop Kafka
```powershell
docker-compose -f docker-compose.kafka.yml down
```

## Restart Kafka
```powershell
docker-compose -f docker-compose.kafka.yml restart
```

## View Kafka Logs
```powershell
docker logs -f fieldtech-kafka
```

---

## What's Next?

Your event-driven architecture is ready! You can now:
1. Test user registration with Kafka events
2. Add more event producers (job.created, payment.completed)
3. Add more event consumers
4. Monitor events in Kafka UI

The foundation is complete! 🚀
