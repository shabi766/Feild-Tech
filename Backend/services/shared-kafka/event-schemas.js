// Event Topics
export const TOPICS = {
    // User Events
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',

    // Company Events
    COMPANY_CREATED: 'company.created',
    COMPANY_UPDATED: 'company.updated',

    // Job Events
    JOB_CREATED: 'job.created',
    JOB_UPDATED: 'job.updated',
    JOB_COMPLETED: 'job.completed',
    JOB_CANCELLED: 'job.cancelled',

    // Payment Events
    PAYMENT_INITIATED: 'payment.initiated',
    PAYMENT_COMPLETED: 'payment.completed',
    PAYMENT_FAILED: 'payment.failed',
    PAYMENT_REFUNDED: 'payment.refunded',

    // Review Events
    REVIEW_CREATED: 'review.created',
    REVIEW_UPDATED: 'review.updated',

    // Application Events
    APPLICATION_SUBMITTED: 'application.submitted',
    APPLICATION_ACCEPTED: 'application.accepted',
    APPLICATION_REJECTED: 'application.rejected',

    // Chat Events
    MESSAGE_SENT: 'message.sent',

    // Notification Events
    NOTIFICATION_SENT: 'notification.sent'
};

// Event Schema Base
export class BaseEvent {
    constructor(eventType, data, metadata = {}) {
        this.eventId = this.generateEventId();
        this.eventType = eventType;
        this.timestamp = new Date().toISOString();
        this.version = '1.0';
        this.data = data;
        this.metadata = {
            source: metadata.source || 'unknown-service',
            correlationId: metadata.correlationId || this.eventId,
            ...metadata
        };
    }

    generateEventId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    toJSON() {
        return {
            eventId: this.eventId,
            eventType: this.eventType,
            timestamp: this.timestamp,
            version: this.version,
            data: this.data,
            metadata: this.metadata
        };
    }
}

// Specific Event Classes
export class UserCreatedEvent extends BaseEvent {
    constructor(userData, metadata) {
        super(TOPICS.USER_CREATED, {
            userId: userData.userId,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phoneNumber: userData.phoneNumber
        }, metadata);
    }
}

export class JobCreatedEvent extends BaseEvent {
    constructor(jobData, metadata) {
        super(TOPICS.JOB_CREATED, {
            jobId: jobData.jobId,
            title: jobData.title,
            description: jobData.description,
            createdBy: jobData.createdBy,
            location: jobData.location,
            budget: jobData.budget
        }, metadata);
    }
}

export class PaymentCompletedEvent extends BaseEvent {
    constructor(paymentData, metadata) {
        super(TOPICS.PAYMENT_COMPLETED, {
            paymentId: paymentData.paymentId,
            jobId: paymentData.jobId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            technicianId: paymentData.technicianId,
            clientId: paymentData.clientId
        }, metadata);
    }
}

export class ReviewCreatedEvent extends BaseEvent {
    constructor(reviewData, metadata) {
        super(TOPICS.REVIEW_CREATED, {
            reviewId: reviewData.reviewId,
            jobId: reviewData.jobId,
            technicianId: reviewData.technicianId,
            reviewerId: reviewData.reviewerId,
            rating: reviewData.rating,
            comment: reviewData.comment
        }, metadata);
    }
}
