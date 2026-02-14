/**
 * Review Service HTTP Client
 * Handles communication with the Review microservice for ratings and reviews
 */

const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:8006';

export class ReviewServiceClient {
    /**
     * Get average rating for an entity
     * @param {string} entityType - Type of entity ('technician', 'company', 'job')
     * @param {string} entityId - Entity ID
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Average rating and total count
     */
    static async getEntityRating(entityType, entityId, token) {
        try {
            const response = await fetch(`${REVIEW_SERVICE_URL}/api/v1/rating/${entityType}/${entityId}/average`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Review Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data || { averageRating: 0, totalRatings: 0 };
        } catch (error) {
            console.error('Error fetching entity rating from Review Service:', error);
            return { averageRating: 0, totalRatings: 0 };
        }
    }

    /**
     * Get ratings for an entity with pagination
     * @param {string} entityType - Type of entity
     * @param {string} entityId - Entity ID
     * @param {string} token - Auth token
     * @param {Object} options - Query options (page, limit, sortBy, order)
     * @returns {Promise<Object>} Ratings data with pagination
     */
    static async getEntityRatings(entityType, entityId, token, options = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (options.page) queryParams.append('page', options.page);
            if (options.limit) queryParams.append('limit', options.limit);
            if (options.sortBy) queryParams.append('sortBy', options.sortBy);
            if (options.order) queryParams.append('order', options.order);

            const url = `${REVIEW_SERVICE_URL}/api/v1/rating/${entityType}/${entityId}?${queryParams}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Review Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data || { ratings: [], statistics: {}, pagination: {} };
        } catch (error) {
            console.error('Error fetching entity ratings from Review Service:', error);
            return { ratings: [], statistics: {}, pagination: {} };
        }
    }

    /**
     * Create a new rating
     * @param {Object} ratingData - Rating data
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Created rating
     */
    static async createRating(ratingData, token) {
        try {
            const response = await fetch(`${REVIEW_SERVICE_URL}/api/v1/rating`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create rating');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error creating rating in Review Service:', error);
            throw error;
        }
    }
}

export default ReviewServiceClient;
