/**
 * Auth Service Client
 * HTTP client for communicating with Auth Service
 * Used to fetch and update user data
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
     * Update user Stripe data
     * @param {string} userId - User ID
     * @param {Object} stripeData - Stripe data to update
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Updated user
     */
    static async updateUserStripeData(userId, stripeData, token) {
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/users/${userId}/stripe`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stripeData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Auth Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.user || data;
        } catch (error) {
            console.error('Error updating user Stripe data:', error);
            throw error;
        }
    }

    /**
     * Update user wallet balance
     * @param {string} userId - User ID
     * @param {number} amount - Amount to add/subtract/set
     * @param {string} operation - 'set', 'add', or 'subtract'
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Updated user
     */
    static async updateUserWalletBalance(userId, amount, operation, token) {
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/users/${userId}/wallet`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ walletBalance: amount, operation })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Auth Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.user || data;
        } catch (error) {
            console.error('Error updating user wallet balance:', error);
            throw error;
        }
    }

    /**
     * Update user KYC data
     * @param {string} userId - User ID
     * @param {Object} kycData - KYC data
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Updated user
     */
    static async updateUserKYC(userId, kycData, token) {
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/users/${userId}/kyc`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(kycData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Auth Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.user || data;
        } catch (error) {
            console.error('Error updating user KYC:', error);
            throw error;
        }
    }
}
