import axios from 'axios';

const COMPANY_SERVICE_URL = process.env.COMPANY_SERVICE_URL || 'http://localhost:8009';

export const CompanyServiceClient = {
    /**
     * Search for companies
     * @param {string} query - Search query
     * @param {string} token - Auth token
     */
    searchCompanies: async (query, token) => {
        try {
            const response = await axios.get(`${COMPANY_SERVICE_URL}/api/v1/company`, {
                params: {
                    search: query,
                    limit: 5
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error searching companies:', error.message);
            return [];
        }
    }
};
