/**
 * Workorder Service Client
 * HTTP client for communicating with Workorder Service
 * Used to fetch workorder data and update payment status
 */

const WORKORDER_SERVICE_URL = process.env.WORKORDER_SERVICE_URL || 'http://localhost:8002';

export class WorkorderServiceClient {
    /**
     * Get workorder/job by ID
     * @param {string} workorderId - Workorder ID
     * @param {string} token - JWT token for authentication
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
            return data.job || data;
        } catch (error) {
            console.error('Error fetching workorder from Workorder Service:', error);
            throw error;
        }
    }

    /**
     * Update workorder payment status
     * @param {string} workorderId - Workorder ID
     * @param {Object} updateData - Data to update
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Updated workorder
     */
    static async updateWorkorderPaymentStatus(workorderId, updateData, token) {
        try {
            const response = await fetch(`${WORKORDER_SERVICE_URL}/api/v1/workorder/update/${workorderId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (!response.ok) {
                throw new Error(`Workorder Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.job || data;
        } catch (error) {
            console.error('Error updating workorder payment status:', error);
            throw error;
        }
    }
}
