import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

export const AuthServiceClient = {
    /**
     * Search for technicians and users
     * @param {string} query - Search query
     * @param {string} token - Auth token
     */
    searchUsers: async (query, token) => {
        try {
            const response = await axios.get(`${AUTH_SERVICE_URL}/api/v1/user`, {
                params: {
                    search: query,
                    role: 'Technician', // Prioritize technicians for global search
                    limit: 5
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.users || [];
        } catch (error) {
            console.error('Error searching users:', error.message);
            return [];
        }
    }
};
