import { Kafka, logLevel } from 'kafkajs';

class KafkaProducer {
    constructor(clientId = 'fieldtech-producer') {
        this.kafka = new Kafka({
            clientId,
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
            logLevel: logLevel.ERROR,
            retry: {
                initialRetryTime: 100,
                retries: 8
            }
        });

        this.producer = this.kafka.producer({
            allowAutoTopicCreation: true,
            transactionTimeout: 30000
        });

        this.isConnected = false;
    }

    async connect() {
        if (!this.isConnected) {
            await this.producer.connect();
            this.isConnected = true;
            console.log('✅ Kafka Producer connected');
        }
    }

    async disconnect() {
        if (this.isConnected) {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('🔌 Kafka Producer disconnected');
        }
    }

    /**
     * Publish an event to Kafka
     * @param {string} topic - Topic name
     * @param {Object} event - Event object (should extend BaseEvent)
     * @param {string} key - Optional partition key
     */
    async publishEvent(topic, event, key = null) {
        try {
            await this.connect();

            const message = {
                value: JSON.stringify(event.toJSON ? event.toJSON() : event),
                headers: {
                    'event-type': event.eventType || topic,
                    'event-id': event.eventId || Date.now().toString(),
                    'timestamp': new Date().toISOString()
                }
            };

            if (key) {
                message.key = key;
            }

            const result = await this.producer.send({
                topic,
                messages: [message]
            });

            console.log(`📤 Event published to ${topic}:`, {
                eventId: event.eventId,
                partition: result[0].partition,
                offset: result[0].offset
            });

            return result;
        } catch (error) {
            console.error(`❌ Failed to publish event to ${topic}:`, error);
            throw error;
        }
    }

    /**
     * Publish multiple events in a batch
     * @param {string} topic - Topic name
     * @param {Array} events - Array of event objects
     */
    async publishBatch(topic, events) {
        try {
            await this.connect();

            const messages = events.map(event => ({
                value: JSON.stringify(event.toJSON ? event.toJSON() : event),
                headers: {
                    'event-type': event.eventType || topic,
                    'event-id': event.eventId || Date.now().toString(),
                    'timestamp': new Date().toISOString()
                }
            }));

            const result = await this.producer.send({
                topic,
                messages
            });

            console.log(`📤 Batch published to ${topic}: ${events.length} events`);
            return result;
        } catch (error) {
            console.error(`❌ Failed to publish batch to ${topic}:`, error);
            throw error;
        }
    }
}

// Singleton instance
let producerInstance = null;

export const getKafkaProducer = (clientId) => {
    if (!producerInstance) {
        producerInstance = new KafkaProducer(clientId);
    }
    return producerInstance;
};

export default KafkaProducer;
