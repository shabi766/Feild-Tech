/**
 * Application Service HTTP Client
 * Handles communication with the Application microservice
 */

const APPLICATION_SERVICE_URL = process.env.APPLICATION_SERVICE_URL || 'http://localhost:8010';

export class ApplicationServiceClient {
    /**
     * Get applications by workorder IDs
     * @param {Array<string>} workorderIds - Array of workorder IDs
     * @param {string} token - Auth token
     * @param {Object} options - Query options (status, limit, etc.)
     * @returns {Promise<Array>} Array of applications
     */
    static async getApplicationsByWorkorders(workorderIds, token, options = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (options.status) queryParams.append('status', options.status);
            if (options.limit) queryParams.append('limit', options.limit);

            const response = await fetch(`${APPLICATION_SERVICE_URL}/api/v1/application/by-workorders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workorderIds }),
            });

            if (!response.ok) {
                throw new Error(`Application Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.applications || data.data || data;
        } catch (error) {
            console.error('Error fetching applications from Application Service:', error);
            throw error;
        }
    }

    /**
     * Count applications by workorder IDs
     * @param {Array<string>} workorderIds - Array of workorder IDs
     * @param {string} token - Auth token
     * @param {Object} options - Query options (status, etc.)
     * @returns {Promise<number>} Count of applications
     */
    static async countApplications(workorderIds, token, options = {}) {
        try {
            const response = await fetch(`${APPLICATION_SERVICE_URL}/api/v1/application/count`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workorderIds,
                    status: options.status
                }),
            });

            if (!response.ok) {
                throw new Error(`Application Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.count || data.data?.count || 0;
        } catch (error) {
            console.error('Error counting applications from Application Service:', error);
            throw error;
        }
    }

    /**
     * Get recent applications
     * @param {Array<string>} workorderIds - Array of workorder IDs
     * @param {string} token - Auth token
     * @param {number} limit - Number of applications to return
     * @returns {Promise<Array>} Array of recent applications
     */
    static async getRecentApplications(workorderIds, token, limit = 5) {
        try {
            const response = await fetch(`${APPLICATION_SERVICE_URL}/api/v1/application/recent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ workorderIds, limit }),
            });

            if (!response.ok) {
                throw new Error(`Application Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.applications || data.data || data;
        } catch (error) {
            console.error('Error fetching recent applications from Application Service:', error);
            throw error;
        }
    }
}

export default ApplicationServiceClient;
