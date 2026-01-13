/**
 * Workorder Service Client
 */

const WORKORDER_SERVICE_URL = process.env.WORKORDER_SERVICE_URL || 'http://localhost:8002';

export class WorkorderServiceClient {
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
}
