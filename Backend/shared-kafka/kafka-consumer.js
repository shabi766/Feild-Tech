import { Kafka } from 'kafkajs';

class KafkaConsumer {
    constructor(serviceName) {
        this.kafka = new Kafka({
            clientId: serviceName,
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });
        this.consumer = this.kafka.consumer({ groupId: `${serviceName}-group` });
        this.handlers = new Map();
    }

    async connect() {
        await this.consumer.connect();
    }

    async subscribe(topics) {
        await this.consumer.subscribe({ topics, fromBeginning: false });
    }

    registerHandler(topic, handler) {
        this.handlers.set(topic, handler);
    }

    async consume(handler = null) {
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const value = JSON.parse(message.value.toString());

                    if (this.handlers.has(topic)) {
                        await this.handlers.get(topic)({ data: value, topic, partition });
                    } else if (handler) {
                        await handler(topic, value);
                    } else {
                        console.warn(`No handler for topic ${topic}`);
                    }
                } catch (error) {
                    console.error(`Error processing message from topic ${topic}:`, error);
                }
            },
        });
    }

    async disconnect() {
        await this.consumer.disconnect();
    }
}

export default KafkaConsumer;
export { KafkaConsumer };
