import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { createChat, deleteChat, deleteMessage, getChats, getMessages, getUnreadMessages, markMessagesAsRead, searchChats, sendMessage } from '../Controllers/chat.controller.js';
import { singleUpload } from '../middleware/multer.js';

const router = express.Router();

// Specific routes should come before parameterized routes
router.route('/unread-messages').get(isAuthenticated, getUnreadMessages);
router.route('/all').get(isAuthenticated, getChats);
router.route('/create').post(isAuthenticated, createChat);
router.route('/send').post(isAuthenticated, singleUpload, sendMessage);
router.route('/search').get(isAuthenticated, searchChats);
router.route('/mark-as-read').post(isAuthenticated, markMessagesAsRead);

// Parameterized routes
router.route('/:chatId').get(isAuthenticated, getMessages);
router.route('/message/:messageId').delete(isAuthenticated, deleteMessage);
router.route('/chat/:chatId').delete(isAuthenticated, deleteChat);

export default router;