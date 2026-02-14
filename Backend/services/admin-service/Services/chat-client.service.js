/**
 * Chat Service HTTP Client
 * Handles communication with the Chat microservice
 */

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:8008';

export class ChatServiceClient {
    /**
     * Get unread message count for a user
     * @param {string} userId - User ID
     * @param {string} token - Auth token
     * @returns {Promise<number>} Count of unread messages
     */
    static async getUnreadMessageCount(userId, token) {
        try {
            const response = await fetch(`${CHAT_SERVICE_URL}/api/v1/chat/unread-count/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Chat Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.count || data.data?.count || 0;
        } catch (error) {
            console.error('Error fetching unread message count from Chat Service:', error);
            return 0;
        }
    }

    /**
     * Get recent conversations for a user
     * @param {string} userId - User ID
     * @param {string} token - Auth token
     * @param {number} limit - Number of conversations to return
     * @returns {Promise<Array>} Array of recent conversations
     */
    static async getRecentConversations(userId, token, limit = 5) {
        try {
            const response = await fetch(`${CHAT_SERVICE_URL}/api/v1/chat/conversations/${userId}?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Chat Service error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.conversations || data.data || [];
        } catch (error) {
            console.error('Error fetching recent conversations from Chat Service:', error);
            return [];
        }
    }
}

export default ChatServiceClient;
