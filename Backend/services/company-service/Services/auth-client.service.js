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

    static async createUser(userData, token) {
        try {
            const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error(`Auth Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.user || data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

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
            console.error('Error fetching users:', error);
            throw error;
        }
    }
}
