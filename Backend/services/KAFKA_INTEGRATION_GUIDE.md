# Kafka Events - Remaining Service Integrations

## Payment Service Integration

### File: `services/payment-service/Controllers/payment.controller.js`

Add at top:
```javascript
import { getKafkaProducer, TOPICS } from '../../shared-kafka/index.js';
import { BaseEvent } from '../../shared-kafka/event-schemas.js';
```

### In `stripeWebhook` function (around line 567):

After successful payment (when `event.type === 'payment_intent.succeeded'`):
```javascript
// Publish payment.completed event
try {
    const producer = getKafkaProducer('payment-service');
    const paymentEvent = new BaseEvent(TOPICS.PAYMENT_COMPLETED, {
        paymentId: paymentIntent.id,
        jobId: paymentIntent.metadata.jobId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        technicianId: paymentIntent.metadata.technicianId,
        clientId: paymentIntent.metadata.clientId
    }, { source: 'payment-service' });
    
    await producer.publishEvent(TOPICS.PAYMENT_COMPLETED, paymentEvent);
    console.log('✅ Published payment.completed event');
} catch (kafkaError) {
    console.error('⚠️ Failed to publish payment.completed event:', kafkaError);
}
```

---

## Company Service Integration

### File: `services/company-service/Controllers/companyRegistration.controller.js`

Add at top:
```javascript
import { getKafkaProducer, CompanyCreatedEvent, TOPICS } from '../../shared-kafka/index.js';
```

### In company registration function:

After successful company creation:
```javascript
// Publish company.created event
try {
    const producer = getKafkaProducer('company-service');
    const event = new CompanyCreatedEvent({
        companyId: company._id.toString(),
        name: company.companyName,
        ownerId: companyOwner._id.toString(),
        industry: company.industry || 'Not specified',
        email: company.email
    }, { source: 'company-service' });
    
    await producer.publishEvent(TOPICS.COMPANY_CREATED, event);
    console.log('✅ Published company.created event');
} catch (kafkaError) {
    console.error('⚠️ Failed to publish company.created event:', kafkaError);
}
```

---

## Application Service Integration

### File: `services/application-service/Controllers/application.controller.js`

Add at top:
```javascript
import { getKafkaProducer, ApplicationSubmittedEvent, TOPICS } from '../../shared-kafka/index.js';
```

### In application submission function:

After successful application creation:
```javascript
// Publish application.submitted event
try {
    const producer = getKafkaProducer('application-service');
    const event = new ApplicationSubmittedEvent({
        applicationId: application._id.toString(),
        jobId: application.jobId.toString(),
        technicianId: application.technicianId.toString(),
        submittedAt: new Date().toISOString()
    }, { source: 'application-service' });
    
    await producer.publishEvent(TOPICS.APPLICATION_SUBMITTED, event);
    console.log('✅ Published application.submitted event');
} catch (kafkaError) {
    console.error('⚠️ Failed to publish application.submitted event:', kafkaError);
}
```

---

## Chat Service Integration

### File: `services/chat-service/Controllers/message.controller.js`

Add at top:
```javascript
import { getKafkaProducer, MessageSentEvent, TOPICS } from '../../shared-kafka/index.js';
```

### In send message function:

After successful message creation:
```javascript
// Publish message.sent event
try {
    const producer = getKafkaProducer('chat-service');
    const event = new MessageSentEvent({
        messageId: message._id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        receiverId: message.receiverId.toString(),
        messageType: message.messageType || 'text',
        sentAt: new Date().toISOString()
    }, { source: 'chat-service' });
    
    await producer.publishEvent(TOPICS.MESSAGE_SENT, event);
} catch (kafkaError) {
    console.error('⚠️ Failed to publish message.sent event:', kafkaError);
}
```

---

## Quick Implementation Script

Run this in each service directory to add Kafka dependency:
```bash
# Already done for shared-kafka, but if needed:
cd services/workorder-service && npm install
cd ../payment-service && npm install  
cd ../review-service && npm install
cd ../company-service && npm install
cd ../application-service && npm install
cd ../chat-service && npm install
```

---

## Testing Each Integration

### 1. Test Workorder Events
```bash
# Create a job
curl -X POST http://localhost:8002/api/v1/workorder/post \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Job",...}'

# Check Kafka UI: http://localhost:8080
# Look for job.created topic
```

### 2. Test Review Events
```bash
# Submit a review
curl -X POST http://localhost:8011/api/v1/review \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"jobId":"...","rating":5,...}'

# Check review.created topic
```

### 3. Test Payment Events
```bash
# Complete a payment (via Stripe webhook)
# Check payment.completed topic
```

---

## Environment Variables

Add to each service's `.env`:
```env
KAFKA_BROKERS=localhost:9092
```

---

## Verification Checklist

- [ ] Workorder Service publishes job events ✅ (Done)
- [ ] Review Service publishes review events ✅ (Done)
- [ ] Payment Service publishes payment events (Manual integration needed)
- [ ] Company Service publishes company events (Manual integration needed)
- [ ] Application Service publishes application events (Manual integration needed)
- [ ] Chat Service publishes message events (Manual integration needed)
- [ ] Notification Service consumes all events (Partially done)

---

## Notes

- All event publishing is non-blocking (wrapped in try-catch)
- Services continue to work even if Kafka is down
- Events are logged for debugging
- Kafka UI available at http://localhost:8080 for monitoring
