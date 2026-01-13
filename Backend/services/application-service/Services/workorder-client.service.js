/**
 * Workorder Service Client
 * HTTP client for communicating with Workorder Service
 */

const WORKORDER_SERVICE_URL = process.env.WORKORDER_SERVICE_URL || 'http://localhost:8002';

export class WorkorderServiceClient {
    /**
     * Get workorder by ID
     * @param {string} workorderId - Workorder ID
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Workorder object
     */
    static async getWorkorder(workorderId, token) {
        try {
            const response = await fetch(`${WORKORDER_SERVICE_URL}/api/v1/workorder/get/${workorderId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Workorder Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.workorder || data;
        } catch (error) {
            console.error('Error fetching workorder from Workorder Service:', error);
            throw error;
        }
    }

    /**
     * Update workorder status
     * @param {string} workorderId - Workorder ID
     * @param {string} status - New status
     * @param {string} assignedApplicant - Assigned applicant ID
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Updated workorder
     */
    static async updateWorkorderStatus(workorderId, status, assignedApplicant, token) {
        try {
            const response = await fetch(`${WORKORDER_SERVICE_URL}/api/v1/workorder/status/${workorderId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status,
                    assignedApplicant 
                })
            });
            
            if (!response.ok) {
                throw new Error(`Workorder Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.workorder || data;
        } catch (error) {
            console.error('Error updating workorder status:', error);
            throw error;
        }
    }
}
