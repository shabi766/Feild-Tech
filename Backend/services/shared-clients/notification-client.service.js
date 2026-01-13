/**
 * Notification Service Client
 * HTTP client for communicating with Notification Service
 * Use this in other services to send notifications
 */

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8004';

export class NotificationServiceClient {
    /**
     * Send a notification
     * @param {Object} notificationData - Notification data
     * @param {string} notificationData.senderId - Sender user ID
     * @param {string} notificationData.recipientId - Recipient user ID
     * @param {string} notificationData.type - Notification type
     * @param {string} notificationData.message - Notification message
     * @param {string} notificationData.jobId - Job ID (optional)
     * @param {string} notificationData.projectId - Project ID (optional)
     * @param {string} notificationData.clientId - Client ID (optional)
     * @param {string} token - JWT token for authentication
     * @returns {Promise<Object>} Created notification
     */
    static async sendNotification(notificationData, token) {
        try {
            const { senderId, recipientId, type, message, jobId, projectId, clientId } = notificationData;
            
            // Determine the correct endpoint based on notification type
            let endpoint = '/api/v1/notification/send';
            let body = {};

            switch (type) {
                case 'job_created':
                    endpoint = '/api/v1/notification/Job-create';
                    body = { message, jobId };
                    break;
                case 'project_created':
                    endpoint = '/api/v1/notification/Project-create';
                    body = { message, projectId };
                    break;
                case 'client_creation':
                    endpoint = '/api/v1/notification/client-create';
                    body = { message, clientId };
                    break;
                case 'job_assignment':
                case 'job_assigned':
                    endpoint = '/api/v1/notification/job-assigned';
                    body = { jobId, applicantIds: [recipientId] };
                    break;
                default:
                    // For job_application and others
                    body = { jobId, message };
            }

            const response = await fetch(`${NOTIFICATION_SERVICE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                throw new Error(`Notification Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.notification || data;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    /**
     * Send job application notification
     * @param {string} jobId - Job ID
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Created notification
     */
    static async sendJobApplicationNotification(jobId, token) {
        try {
            const response = await fetch(`${NOTIFICATION_SERVICE_URL}/api/v1/notification/send`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jobId })
            });
            
            if (!response.ok) {
                throw new Error(`Notification Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.notification || data;
        } catch (error) {
            console.error('Error sending job application notification:', error);
            throw error;
        }
    }

    /**
     * Send job assigned notification
     * @param {string} jobId - Job ID
     * @param {string[]} applicantIds - Array of applicant user IDs
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Created notifications
     */
    static async sendJobAssignedNotification(jobId, applicantIds, token) {
        try {
            const response = await fetch(`${NOTIFICATION_SERVICE_URL}/api/v1/notification/job-assigned`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jobId, applicantIds })
            });
            
            if (!response.ok) {
                throw new Error(`Notification Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.notifications || data;
        } catch (error) {
            console.error('Error sending job assigned notification:', error);
            throw error;
        }
    }
}
