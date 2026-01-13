/**
 * Leaderboard Service Client
 * Used to notify leaderboard service when reviews are created/updated
 */

const LEADERBOARD_SERVICE_URL = process.env.LEADERBOARD_SERVICE_URL || 'http://localhost:8010';

export class LeaderboardServiceClient {
    /**
     * Notify leaderboard service to update technician stats
     * @param {string} technicianId - Technician ID
     * @param {string} token - JWT token
     */
    static async updateTechnicianStats(technicianId, token) {
        try {
            const response = await fetch(`${LEADERBOARD_SERVICE_URL}/api/v1/leaderboard/update/${technicianId}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Don't throw error if leaderboard service is not available
            if (!response.ok) {
                console.warn('Leaderboard Service update failed:', response.statusText);
            }
        } catch (error) {
            console.warn('Error updating leaderboard (non-critical):', error.message);
            // Don't throw - this is a non-critical operation
        }
    }
}
