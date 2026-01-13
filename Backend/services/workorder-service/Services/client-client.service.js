/**
 * Client Service Client
 * HTTP client for communicating with Client Service
 * Used to fetch client and project data
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
     * Get project by ID
     * @param {string} projectId - Project ID
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Project object
     */
    static async getProject(projectId, token) {
        try {
            if (!projectId || projectId === "") {
                return null;
            }

            const response = await fetch(`${CLIENT_SERVICE_URL}/api/v1/project/get/${projectId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Client Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.project || data;
        } catch (error) {
            console.error('Error fetching project from Client Service:', error);
            throw error;
        }
    }

    /**
     * Find client and project by IDs (helper method)
     * @param {string} clientId - Client ID
     * @param {string} projectId - Project ID (optional)
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Object with client and project
     */
    static async findClientAndProject(clientId, projectId, token) {
        try {
            const [client, project] = await Promise.all([
                this.getClient(clientId, token),
                projectId ? this.getProject(projectId, token) : Promise.resolve(null)
            ]);
            
            return { client, project };
        } catch (error) {
            console.error('Error finding client and project:', error);
            throw error;
        }
    }
}
