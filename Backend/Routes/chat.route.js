import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { createChat, deleteChat, deleteMessage, getChats, getMessages, markMessagesAsRead, searchChats, sendMessage } from '../Controllers/chat.controller.js';
import { singleUpload } from '../middleware/multer.js';




const router = express.Router();

router.route('/all').get(isAuthenticated, getChats ); 
router.route('/:chatId').get(isAuthenticated, getMessages ); 
router.route('/create').post(isAuthenticated, createChat );
router.route('/send').post(isAuthenticated, singleUpload, sendMessage );

router.route('/search').get(isAuthenticated, searchChats );
router.route('/message/:messageId').delete(isAuthenticated, deleteMessage);
router.route('/chat/:chatId').delete(isAuthenticated, deleteChat);
router.route('/mark-as-read').post(isAuthenticated, markMessagesAsRead);


export default router;