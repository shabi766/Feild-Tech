/**
 * Auth Service Client
 * HTTP client for communicating with Auth Service
 * Used to fetch user data for dashboards and audit logs
 */

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

export class AuthServiceClient {
    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @param {string} token - JWT token for authentication
     * @returns {Promise<Object>} User object
     */
    static async getUser(userId, token) {
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/users/${userId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Auth Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.user || data;
        } catch (error) {
            console.error('Error fetching user from Auth Service:', error);
            throw error;
        }
    }

    /**
     * Get multiple users by IDs
     * @param {string[]} userIds - Array of user IDs
     * @param {string} token - JWT token
     * @returns {Promise<Object[]>} Array of user objects
     */
    static async getUsers(userIds, token) {
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/users/batch`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userIds })
            });
            
            if (!response.ok) {
                throw new Error(`Auth Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Error fetching users from Auth Service:', error);
            throw error;
        }
    }
}
