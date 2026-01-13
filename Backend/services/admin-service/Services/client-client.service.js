/**
 * Client Service Client
 * HTTP client for communicating with Client Service
 * Used to fetch client and project data for dashboards
 */

const CLIENT_SERVICE_URL = process.env.CLIENT_SERVICE_URL || 'http://localhost:8003';

export class ClientServiceClient {
    /**
     * Get client by ID
     * @param {string} clientId - Client ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise<Object>} Client object
     */
    static async getClient(clientId, token) {
        try {
            const response = await fetch(`${CLIENT_SERVICE_URL}/api/v1/client/get/${clientId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Client Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.client || data;
        } catch (error) {
            console.error('Error fetching client from Client Service:', error);
            throw error;
        }
    }

    /**
     * Get all clients
     * @param {string} token - JWT token
     * @returns {Promise<Object[]>} Array of client objects
     */
    static async getClients(token) {
        try {
            const response = await fetch(`${CLIENT_SERVICE_URL}/api/v1/client/get`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Client Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.clients || [];
        } catch (error) {
            console.error('Error fetching clients from Client Service:', error);
            throw error;
        }
    }
}
