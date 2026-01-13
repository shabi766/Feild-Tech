/**
 * Workorder Service Client
 * HTTP client for communicating with Workorder Service
 * Used to fetch workorder/job data for dashboards
 */

const WORKORDER_SERVICE_URL = process.env.WORKORDER_SERVICE_URL || 'http://localhost:8002';

export class WorkorderServiceClient {
    /**
     * Get workorders/jobs by filter
     * @param {Object} filter - Filter object (e.g., { Company: [companyId] })
     * @param {string} token - JWT token for authentication
     * @param {Object} options - Options (limit, sort, select)
     * @returns {Promise<Object[]>} Array of workorder objects
     */
    static async getWorkorders(filter, token, options = {}) {
        try {
            const { limit = 100, sort = '-createdAt', select } = options;
            
            // Build query string
            const params = new URLSearchParams();
            if (limit) params.append('limit', limit);
            if (sort) params.append('sort', sort);
            if (select) params.append('select', select);
            
            // For now, we'll need to fetch all and filter client-side
            // Or add a search/filter endpoint to Workorder Service
            const response = await fetch(`${WORKORDER_SERVICE_URL}/api/v1/workorder/get?${params}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Workorder Service error: ${response.statusText}`);
            }
            
            const data = await response.json();
            let workorders = data.jobs || data.workorders || [];
            
            // Filter client-side if needed (temporary until Workorder Service adds filter endpoint)
            if (filter) {
                if (filter.Company && Array.isArray(filter.Company)) {
                    workorders = workorders.filter(w => 
                        w.Company && filter.Company.some(c => 
                            w.Company.includes(c) || w.Company.toString() === c.toString()
                        )
                    );
                }
                if (filter.created_by) {
                    workorders = workorders.filter(w => 
                        w.created_by && w.created_by.toString() === filter.created_by.toString()
                    );
                }
                if (filter.isIndividual !== undefined) {
                    workorders = workorders.filter(w => w.isIndividual === filter.isIndividual);
                }
            }
            
            return workorders;
        } catch (error) {
            console.error('Error fetching workorders from Workorder Service:', error);
            throw error;
        }
    }

    /**
     * Count workorders by filter
     * @param {Object} filter - Filter object
     * @param {string} token - JWT token
     * @returns {Promise<number>} Count of workorders
     */
    static async countWorkorders(filter, token) {
        try {
            const workorders = await this.getWorkorders(filter, token, { limit: 10000 });
            return workorders.length;
        } catch (error) {
            console.error('Error counting workorders:', error);
            throw error;
        }
    }
}
