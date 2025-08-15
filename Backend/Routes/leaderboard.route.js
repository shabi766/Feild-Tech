import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import {
    getGlobalLeaderboard,
    getCategoryLeaderboard,
    getTopPerformers,
    getTechnicianRanking,
    updateLeaderboardRankings,
    getLeaderboardStats,
    getTrendingTechnicians
} from '../Controllers/leaderboard.controller.js';

const router = express.Router();

// Get global leaderboard
router.get('/global', getGlobalLeaderboard);

// Get category-specific leaderboard
router.get('/category/:category', getCategoryLeaderboard);

// Get top performers
router.get('/top-performers', getTopPerformers);

// Get trending technicians
router.get('/trending', getTrendingTechnicians);

// Get leaderboard statistics
router.get('/stats', getLeaderboardStats);

// Get specific technician's ranking
router.get('/technician/:technicianId', getTechnicianRanking);

// Update leaderboard rankings (admin only)
router.post('/update-rankings', isAuthenticated, updateLeaderboardRankings);

export default router;
