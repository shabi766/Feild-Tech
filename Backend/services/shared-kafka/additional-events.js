import { BaseEvent, TOPICS } from './event-schemas.js';

// Job Events
export class JobCreatedEvent extends BaseEvent {
    constructor(jobData, metadata) {
        super(TOPICS.JOB_CREATED, {
            jobId: jobData.jobId,
            title: jobData.title,
            description: jobData.description,
            createdBy: jobData.createdBy,
            location: jobData.location,
            budget: jobData.budget,
            category: jobData.category,
            status: jobData.status || 'Open'
        }, metadata);
    }
}

export class JobUpdatedEvent extends BaseEvent {
    constructor(jobData, metadata) {
        super(TOPICS.JOB_UPDATED, {
            jobId: jobData.jobId,
            updatedFields: jobData.updatedFields,
            status: jobData.status,
            updatedBy: jobData.updatedBy
        }, metadata);
    }
}

export class JobCompletedEvent extends BaseEvent {
    constructor(jobData, metadata) {
        super(TOPICS.JOB_COMPLETED, {
            jobId: jobData.jobId,
            technicianId: jobData.technicianId,
            clientId: jobData.clientId,
            completionDate: jobData.completionDate,
            finalAmount: jobData.finalAmount
        }, metadata);
    }
}

export class JobCancelledEvent extends BaseEvent {
    constructor(jobData, metadata) {
        super(TOPICS.JOB_CANCELLED, {
            jobId: jobData.jobId,
            reason: jobData.reason,
            cancelledBy: jobData.cancelledBy,
            cancelledAt: jobData.cancelledAt
        }, metadata);
    }
}

// Application Events
export class ApplicationSubmittedEvent extends BaseEvent {
    constructor(appData, metadata) {
        super(TOPICS.APPLICATION_SUBMITTED, {
            applicationId: appData.applicationId,
            jobId: appData.jobId,
            technicianId: appData.technicianId,
            submittedAt: appData.submittedAt
        }, metadata);
    }
}

export class ApplicationAcceptedEvent extends BaseEvent {
    constructor(appData, metadata) {
        super(TOPICS.APPLICATION_ACCEPTED, {
            applicationId: appData.applicationId,
            jobId: appData.jobId,
            technicianId: appData.technicianId,
            acceptedAt: appData.acceptedAt
        }, metadata);
    }
}

export class ApplicationRejectedEvent extends BaseEvent {
    constructor(appData, metadata) {
        super(TOPICS.APPLICATION_REJECTED, {
            applicationId: appData.applicationId,
            jobId: appData.jobId,
            technicianId: appData.technicianId,
            reason: appData.reason,
            rejectedAt: appData.rejectedAt
        }, metadata);
    }
}

// Company Events
export class CompanyCreatedEvent extends BaseEvent {
    constructor(companyData, metadata) {
        super(TOPICS.COMPANY_CREATED, {
            companyId: companyData.companyId,
            name: companyData.name,
            ownerId: companyData.ownerId,
            industry: companyData.industry,
            email: companyData.email
        }, metadata);
    }
}

export class CompanyUpdatedEvent extends BaseEvent {
    constructor(companyData, metadata) {
        super(TOPICS.COMPANY_UPDATED, {
            companyId: companyData.companyId,
            updatedFields: companyData.updatedFields
        }, metadata);
    }
}

export class TeamCreatedEvent extends BaseEvent {
    constructor(teamData, metadata) {
        super(TOPICS.TEAM_CREATED, {
            teamId: teamData.teamId,
            companyId: teamData.companyId,
            name: teamData.name,
            createdBy: teamData.createdBy,
            memberCount: teamData.memberCount
        }, metadata);
    }
}

// Message Events
export class MessageSentEvent extends BaseEvent {
    constructor(messageData, metadata) {
        super(TOPICS.MESSAGE_SENT, {
            messageId: messageData.messageId,
            conversationId: messageData.conversationId,
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            messageType: messageData.messageType,
            sentAt: messageData.sentAt
        }, metadata);
    }
}
