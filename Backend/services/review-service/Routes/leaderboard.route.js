import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    getGlobalLeaderboard,
    getCategoryLeaderboard,
    getTopPerformers,
    getTechnicianRanking,
    updateLeaderboardRankings,
    updateTechnicianStats,
    getLeaderboardStats,
    getTrendingTechnicians
} from "../Controllers/leaderboard.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getGlobalLeaderboard);
router.route("/category/:category").get(isAuthenticated, getCategoryLeaderboard);
router.route("/top").get(isAuthenticated, getTopPerformers);
router.route("/technician/:technicianId").get(isAuthenticated, getTechnicianRanking);
router.route("/update-rankings").post(isAuthenticated, updateLeaderboardRankings);
router.route("/update/:technicianId").post(isAuthenticated, updateTechnicianStats);
router.route("/stats").get(isAuthenticated, getLeaderboardStats);
router.route("/trending").get(isAuthenticated, getTrendingTechnicians);

export default router;
