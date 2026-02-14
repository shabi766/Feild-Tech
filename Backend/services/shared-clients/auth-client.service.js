/**
 * Auth Service Client
 * HTTP client for communicating with Auth Service
 * Use this in other services to fetch user data
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
     * Verify token and get user info
     * @param {string} token - JWT token
     * @returns {Promise<Object>} User object with token data
     */
    static async verifyToken(token) {
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Token verification failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.user || data;
        } catch (error) {
            console.error('Error verifying token:', error);
            throw error;
        }
    }

    /**
     * Get multiple users by IDs (batch)
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
     * Register a new user (for internal service use)
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Created user object
     */
    static async registerUser(userData) {
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Auth Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data; // Returns { success: true, message: "...", user: ... } (Wait, register returns message only? No, usually no user data)
        } catch (error) {
            console.error('Error registering user via Auth Service:', error);
            throw error;
        }
    }
}
