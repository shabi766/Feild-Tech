/**
 * Auth Service Client
 * HTTP client for communicating with Auth Service
 */

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

export class AuthServiceClient {
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
}
