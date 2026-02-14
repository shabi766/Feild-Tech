/**
 * Company Service HTTP Client
 * Handles communication with the Company microservice
 */

const COMPANY_SERVICE_URL = process.env.COMPANY_SERVICE_URL || 'http://localhost:8004';

export class CompanyServiceClient {
    /**
     * Get company by ID
     * @param {string} companyId - Company ID
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Company data
     */
    static async getCompany(companyId, token) {
        try {
            const response = await fetch(`${COMPANY_SERVICE_URL}/api/v1/company/${companyId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Company Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.company || data.data || data;
        } catch (error) {
            console.error('Error fetching company from Company Service:', error);
            throw error;
        }
    }

    /**
     * Get multiple companies by IDs
     * @param {Array<string>} companyIds - Array of company IDs
     * @param {string} token - Auth token
     * @returns {Promise<Array>} Array of companies
     */
    static async getCompanies(companyIds, token) {
        try {
            const response = await fetch(`${COMPANY_SERVICE_URL}/api/v1/company/batch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ companyIds }),
            });

            if (!response.ok) {
                throw new Error(`Company Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.companies || data.data || data;
        } catch (error) {
            console.error('Error fetching companies from Company Service:', error);
            throw error;
        }
    }

    /**
     * Get company statistics
     * @param {string} companyId - Company ID
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Company statistics
     */
    static async getCompanyStats(companyId, token) {
        try {
            const response = await fetch(`${COMPANY_SERVICE_URL}/api/v1/company/${companyId}/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Company Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.stats || data.data || data;
        } catch (error) {
            console.error('Error fetching company stats from Company Service:', error);
            throw error;
        }
    }
}

export default CompanyServiceClient;
