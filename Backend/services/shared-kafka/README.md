# Shared Kafka Library

Reusable Kafka utilities for FieldTech microservices.

## Installation

```bash
cd services/shared-kafka
npm install
```

## Usage

### Producer

```javascript
import { getKafkaProducer, UserCreatedEvent, TOPICS } from '../shared-kafka/index.js';

const producer = getKafkaProducer('auth-service');

// Create and publish event
const event = new UserCreatedEvent({
  userId: user._id,
  email: user.email,
  name: user.name,
  role: user.role
}, {
  source: 'auth-service',
  correlationId: req.id
});

await producer.publishEvent(TOPICS.USER_CREATED, event, user._id.toString());
```

### Consumer

```javascript
import { KafkaConsumer, TOPICS } from '../shared-kafka/index.js';

const consumer = new KafkaConsumer('notification-service-group', 'notification-service');

// Register handlers
consumer.registerHandler(TOPICS.USER_CREATED, async (event) => {
  console.log('User created:', event.data);
  // Send welcome email
  await sendWelcomeEmail(event.data.email, event.data.name);
});

// Subscribe and start consuming
await consumer.subscribe([TOPICS.USER_CREATED, TOPICS.JOB_CREATED]);
```

## Event Schemas

All events extend `BaseEvent` and include:
- `eventId`: Unique identifier
- `eventType`: Event type (topic name)
- `timestamp`: ISO timestamp
- `version`: Schema version
- `data`: Event payload
- `metadata`: Source, correlationId, etc.

## Environment Variables

```env
KAFKA_BROKERS=localhost:9092
```
