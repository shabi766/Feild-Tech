/**
 * Workorder Service Client
 * HTTP client for communicating with Workorder Service
 * Used to fetch job/workorder data for notifications
 */

const WORKORDER_SERVICE_URL = process.env.WORKORDER_SERVICE_URL || 'http://localhost:8002';

export class WorkorderServiceClient {
    /**
     * Get workorder/job by ID
     * @param {string} jobId - Job ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise<Object>} Job object
     */
    static async getJob(jobId, token) {
        try {
            const response = await fetch(`${WORKORDER_SERVICE_URL}/api/v1/workorder/get/${jobId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Workorder Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.job || data;
        } catch (error) {
            console.error('Error fetching job from Workorder Service:', error);
            throw error;
        }
    }
}
