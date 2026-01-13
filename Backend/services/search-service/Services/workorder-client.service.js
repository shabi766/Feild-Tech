import axios from 'axios';

const WORKORDER_SERVICE_URL = process.env.WORKORDER_SERVICE_URL || 'http://localhost:8002';

export const WorkorderServiceClient = {
    /**
     * Search for jobs/workorders
     * @param {string} query - Search query
     * @param {string} token - Auth token
     */
    searchJobs: async (query, token) => {
        try {
            const response = await axios.get(`${WORKORDER_SERVICE_URL}/api/v1/workorder`, {
                params: {
                    search: query,
                    limit: 5
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.workorders || [];
        } catch (error) {
            console.error('Error searching jobs:', error.message);
            return [];
        }
    }
};
