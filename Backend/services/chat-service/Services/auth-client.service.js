/**
 * Auth Service Client
 * HTTP client for communicating with Auth Service
 * Used to fetch user data and update user status
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

    /**
     * Update user status (online/offline/away)
     * Note: This might need to be added to Auth Service or handled differently
     * For now, we'll keep status updates in Chat Service via direct DB access during migration
     * @param {string} userId - User ID
     * @param {string} status - Status (online, offline, away)
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Updated user
     */
    static async updateUserStatus(userId, status, token) {
        try {
            // TODO: Add this endpoint to Auth Service
            // For now, this is a placeholder
            // During migration, we might update user status directly in Chat Service
            console.log(`Would update user ${userId} status to ${status}`);
            return { success: true };
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }
}
