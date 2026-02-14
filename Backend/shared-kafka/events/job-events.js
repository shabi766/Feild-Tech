class JobCreatedEvent {
    constructor(data, metadata = {}) {
        this.type = 'JobCreated';
        this.data = data;
        this.metadata = {
            timestamp: new Date().toISOString(),
            ...metadata
        };
    }
}

class JobUpdatedEvent {
    constructor(data, metadata = {}) {
        this.type = 'JobUpdated';
        this.data = data;
        this.metadata = {
            timestamp: new Date().toISOString(),
            ...metadata
        };
    }
}

class JobCompletedEvent {
    constructor(data, metadata = {}) {
        this.type = 'JobCompleted';
        this.data = data;
        this.metadata = {
            timestamp: new Date().toISOString(),
            ...metadata
        };
    }
}

class JobCancelledEvent {
    constructor(data, metadata = {}) {
        this.type = 'JobCancelled';
        this.data = data;
        this.metadata = {
            timestamp: new Date().toISOString(),
            ...metadata
        };
    }
}

export {
    JobCreatedEvent,
    JobUpdatedEvent,
    JobCompletedEvent,
    JobCancelledEvent
};
