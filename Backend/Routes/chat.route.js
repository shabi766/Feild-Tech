import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { createChat, getChats, getMessages, searchChats, sendMessage } from '../Controllers/chat.controller.js';
import { singleUpload } from '../middleware/multer.js';




const router = express.Router();

router.route('/all').get(isAuthenticated, getChats ); 
router.route('/:chatId').get(isAuthenticated, getMessages ); 
router.route('/create').post(isAuthenticated, createChat );
router.route('/send').post(isAuthenticated, singleUpload, sendMessage );

router.route('/search').get(isAuthenticated, searchChats );

export default router;