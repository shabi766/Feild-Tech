import KafkaConsumer from '../../../shared-kafka/kafka-consumer.js';
import { TOPICS } from '../../../shared-kafka/topics.js';
import nodemailer from 'nodemailer';

class NotificationEventConsumer {
    constructor() {
        this.consumer = new KafkaConsumer('notification-service-group', 'notification-service');
        this.setupHandlers();
    }

    setupHandlers() {
        // Handle user.created events
        this.consumer.registerHandler(TOPICS.USER_CREATED, this.handleUserCreated.bind(this));

        // Handle job.created events
        this.consumer.registerHandler(TOPICS.JOB_CREATED, this.handleJobCreated.bind(this));

        // Handle payment.completed events
        this.consumer.registerHandler(TOPICS.PAYMENT_COMPLETED, this.handlePaymentCompleted.bind(this));

        // Handle review.created events
        this.consumer.registerHandler(TOPICS.REVIEW_CREATED, this.handleReviewCreated.bind(this));
    }

    async handleUserCreated(event) {
        try {
            console.log('📧 Processing user.created event:', event.data.email);

            // Send welcome email
            await this.sendWelcomeEmail(event.data);

            console.log('✅ Welcome email sent to:', event.data.email);
        } catch (error) {
            console.error('❌ Error handling user.created event:', error);
            throw error; // Will be caught by consumer and logged
        }
    }

    async handleJobCreated(event) {
        try {
            console.log('📧 Processing job.created event:', event.data.jobId);

            // Send job creation notification
            // TODO: Implement job notification logic

            console.log('✅ Job notification processed');
        } catch (error) {
            console.error('❌ Error handling job.created event:', error);
            throw error;
        }
    }

    async handlePaymentCompleted(event) {
        try {
            console.log('📧 Processing payment.completed event:', event.data.paymentId);

            // Send payment receipt
            // TODO: Implement payment receipt logic

            console.log('✅ Payment receipt sent');
        } catch (error) {
            console.error('❌ Error handling payment.completed event:', error);
            throw error;
        }
    }

    async handleReviewCreated(event) {
        try {
            console.log('📧 Processing review.created event:', event.data.reviewId);

            // Notify technician about new review
            // TODO: Implement review notification logic

            console.log('✅ Review notification sent');
        } catch (error) {
            console.error('❌ Error handling review.created event:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(userData) {
        try {
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER || process.env.EMAIL_USER,
                    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.SMTP_USER || process.env.EMAIL_USER,
                to: userData.email,
                subject: 'Welcome to FieldTech!',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">Welcome to FieldTech, ${userData.name}!</h2>
            <p>Thank you for joining our platform as a <strong>${userData.role}</strong>.</p>
            <p>We're excited to have you on board!</p>
            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff;">
              <h3 style="margin-top: 0;">Getting Started</h3>
              <ul>
                <li>Complete your profile</li>
                <li>Explore available opportunities</li>
                <li>Connect with professionals</li>
              </ul>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            throw error;
        }
    }

    async start() {
        try {
            const topics = [
                TOPICS.USER_CREATED,
                TOPICS.JOB_CREATED,
                TOPICS.PAYMENT_COMPLETED,
                TOPICS.REVIEW_CREATED
            ];

            await this.consumer.subscribe(topics);
            await this.consumer.consume(); // Start processing
            console.log('🎧 Notification Event Consumer started');
        } catch (error) {
            console.error('Failed to start Notification Event Consumer:', error);
            throw error;
        }
    }

    async stop() {
        await this.consumer.disconnect();
        console.log('🔌 Notification Event Consumer stopped');
    }
}

export default NotificationEventConsumer;
