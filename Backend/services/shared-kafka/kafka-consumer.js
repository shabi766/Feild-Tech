import { Kafka, logLevel } from 'kafkajs';

class KafkaConsumer {
    constructor(groupId, clientId = 'fieldtech-consumer') {
        this.kafka = new Kafka({
            clientId,
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
            logLevel: logLevel.ERROR,
            retry: {
                initialRetryTime: 100,
                retries: 8
            }
        });

        this.consumer = this.kafka.consumer({
            groupId,
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
            maxWaitTimeInMs: 100,
            retry: {
                retries: 5
            }
        });

        this.isConnected = false;
        this.handlers = new Map();
    }

    async connect() {
        if (!this.isConnected) {
            await this.consumer.connect();
            this.isConnected = true;
            console.log('✅ Kafka Consumer connected');
        }
    }

    async disconnect() {
        if (this.isConnected) {
            await this.consumer.disconnect();
            this.isConnected = false;
            console.log('🔌 Kafka Consumer disconnected');
        }
    }

    /**
     * Subscribe to a topic and register a handler
     * @param {string} topic - Topic name
     * @param {Function} handler - Message handler function
     */
    registerHandler(topic, handler) {
        this.handlers.set(topic, handler);
    }

    /**
     * Subscribe to topics and start consuming
     * @param {Array<string>} topics - Array of topic names
     */
    async subscribe(topics) {
        try {
            await this.connect();

            // Subscribe to all topics
            for (const topic of topics) {
                await this.consumer.subscribe({ topic, fromBeginning: false });
                console.log(`📥 Subscribed to topic: ${topic}`);
            }

            // Start consuming
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const event = JSON.parse(message.value.toString());
                        const eventType = message.headers['event-type']?.toString() || topic;

                        console.log(`📨 Received event from ${topic}:`, {
                            eventId: event.eventId,
                            eventType,
                            partition,
                            offset: message.offset
                        });

                        // Get handler for this topic
                        const handler = this.handlers.get(topic);
                        if (handler) {
                            await handler(event, { topic, partition, offset: message.offset });
                        } else {
                            console.warn(`⚠️ No handler registered for topic: ${topic}`);
                        }
                    } catch (error) {
                        console.error(`❌ Error processing message from ${topic}:`, error);
                        // Don't throw - let consumer continue processing other messages
                        // In production, send to dead letter queue
                    }
                }
            });

            console.log('🎧 Kafka Consumer is running...');
        } catch (error) {
            console.error('❌ Failed to start consumer:', error);
            throw error;
        }
    }

    /**
     * Pause consumption
     */
    async pause(topics) {
        const topicPartitions = topics.map(topic => ({ topic }));
        this.consumer.pause(topicPartitions);
        console.log('⏸️ Consumer paused');
    }

    /**
     * Resume consumption
     */
    async resume(topics) {
        const topicPartitions = topics.map(topic => ({ topic }));
        this.consumer.resume(topicPartitions);
        console.log('▶️ Consumer resumed');
    }
}

export default KafkaConsumer;
