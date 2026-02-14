import { Kafka } from 'kafkajs';

class KafkaProducer {
    constructor(serviceName) {
        this.kafka = new Kafka({
            clientId: serviceName,
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });
        this.producer = this.kafka.producer();
        this.isConnected = false;
    }

    async connect() {
        if (!this.isConnected) {
            await this.producer.connect();
            this.isConnected = true;
        }
    }

    async publishEvent(topic, event, key) {
        if (!this.isConnected) {
            await this.connect();
        }

        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: key || event.id || String(Date.now()),
                        value: JSON.stringify(event),
                    },
                ],
            });
            console.log(`Event published to ${topic}`);
        } catch (error) {
            console.error(`Error publishing event to ${topic}:`, error);
            throw error;
        }
    }

    async disconnect() {
        await this.producer.disconnect();
        this.isConnected = false;
    }
}

// Singleton map to manage producers per service if needed
const producers = new Map();

const getKafkaProducer = (serviceName) => {
    if (!producers.has(serviceName)) {
        producers.set(serviceName, new KafkaProducer(serviceName));
    }
    return producers.get(serviceName);
};

export { KafkaProducer, getKafkaProducer };
export default { KafkaProducer, getKafkaProducer };
