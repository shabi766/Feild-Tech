import express from 'express';
import { searchItems } from '../Controllers/search.controller.js'; // Controller you'll create
import isAuthenticated from '../middleware/isAuthenticated.js'; // Middleware if search requires authentication

const router = express.Router();

// Define a GET route for search
router.route('/search').get(isAuthenticated, searchItems);

export default router;
