import { Chat } from "../Models/chat.model.js";
import { AuthServiceClient } from "../Services/auth-client.service.js";
import { uploadToS3 } from "../utils/s3Upload.js";

export const createChat = async (req, res) => {
    try {
        const { userId, groupName, participantIds } = req.body;
        const currentUserId = req.user.userId || req.user._id;

        if (!userId && !participantIds) {
            return res.status(400).json({ success: false, message: "User ID or participant IDs are required." });
        }

        let chat;
        if (groupName) {
            chat = new Chat({
                participants: [currentUserId, ...participantIds],
                isGroupChat: true,
                groupName
            });
        } else {
            chat = await Chat.findOne({
                participants: { $all: [currentUserId, userId] },
                isGroupChat: false,
            });

            if (!chat) {
                chat = new Chat({
                    participants: [currentUserId, userId],
                    isGroupChat: false
                });
            }
        }

        await chat.save();
        res.status(201).json({ success: true, chat });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { chatId, message, type, fileUrl } = req.body;
        const userId = req.user.userId || req.user._id;

        if (!chatId || !message || !userId) {
            return res.status(400).json({ message: "Missing required fields", success: false });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found", success: false });
        }

        // Verify user is a participant
        if (!chat.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a participant in this chat", success: false });
        }

        const newMessage = {
            sender: userId,
            content: message,
            type: type || "text",
            fileUrl: fileUrl || null,
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Get the last message (the one we just added)
        const lastMessage = chat.messages[chat.messages.length - 1];

        // Fetch user data for the message
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        let messageWithSender = lastMessage.toObject();

        if (token) {
            try {
                const sender = await AuthServiceClient.getUser(userId, token);
                messageWithSender.sender = sender;
            } catch (error) {
                console.error('Error fetching sender:', error);
            }
        }

        // Check if recipient is online and mark as read
        const io = req.app.get("io");
        const recipientId = chat.participants.find(p => p.toString() !== userId.toString());

        if (recipientId && io) {
            const isRecipientOnline = io.sockets.adapter.rooms.has(recipientId.toString());
            if (isRecipientOnline) {
                lastMessage.isRead = true;
                await chat.save();
                messageWithSender.isRead = true;
            }
        }

        // Emit to chat room
        if (io) {
            io.to(chatId).emit("new_message", messageWithSender);
        }

        res.json({ message: messageWithSender, success: true });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const { chatId } = req.body;
        const userId = req.user.userId || req.user._id;

        if (!chatId) {
            return res.status(400).json({ success: false, message: "Chat ID is required" });
        }

        // Check if chat exists and user is a participant
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        if (!chat.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({ success: false, message: "You are not a participant in this chat" });
        }

        // Upload file to S3
        const fileUrl = await uploadToS3(req.file, 'chat-files');

        res.json({
            success: true,
            fileUrl: fileUrl,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ success: false, message: "Failed to upload file", error: error.message });
    }
};

export const getChats = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const chats = await Chat.find({ participants: userId })
            .sort({ updatedAt: -1 });

        if (!chats || chats.length === 0) {
            return res.json({ chats: [], success: true });
        }

        // Fetch participant data from Auth Service
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const chatsWithParticipants = await Promise.all(chats.map(async (chat) => {
            const chatObj = chat.toObject();

            if (chat.participants && token) {
                try {
                    const participants = await AuthServiceClient.getUsers(chat.participants, token);
                    chatObj.participants = participants;
                } catch (error) {
                    console.error(`Error fetching participants for chat ${chat._id}:`, error);
                }
            }

            return chatObj;
        }));

        res.json({ chats: chatsWithParticipants, success: true });
    } catch (error) {
        console.error("Error getting chats:", error);
        res.status(500).json({ error: error.message, success: false });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.userId || req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found", success: false });
        }

        // Verify user is a participant
        if (!chat.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a participant in this chat", success: false });
        }

        // Fetch sender data for messages
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const messagesWithSenders = await Promise.all(chat.messages.map(async (message) => {
            const msgObj = message.toObject();

            if (message.sender && token) {
                try {
                    const sender = await AuthServiceClient.getUser(message.sender, token);
                    msgObj.sender = sender;
                } catch (error) {
                    console.error(`Error fetching sender for message ${message._id}:`, error);
                }
            }

            return msgObj;
        }));

        res.json({ messages: messagesWithSenders, success: true });
    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ error: error.message, success: false });
    }
};

export const searchChats = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.userId || req.user._id;

        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required." });
        }

        const chats = await Chat.find({
            participants: userId,
            $or: [
                { groupName: { $regex: query, $options: "i" } },
                { "messages.content": { $regex: query, $options: "i" } },
            ],
        });

        // Fetch participant data
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const chatsWithParticipants = await Promise.all(chats.map(async (chat) => {
            const chatObj = chat.toObject();

            if (chat.participants && token) {
                try {
                    const participants = await AuthServiceClient.getUsers(chat.participants, token);
                    chatObj.participants = participants;
                } catch (error) {
                    console.error(`Error fetching participants:`, error);
                }
            }

            return chatObj;
        }));

        res.json({ success: true, chats: chatsWithParticipants });
    } catch (error) {
        console.error("Error searching chats:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.userId || req.user._id;

        const chat = await Chat.findOne({ "messages._id": messageId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Verify user is the sender
        const message = chat.messages.id(messageId);
        if (!message || message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own messages" });
        }

        chat.messages = chat.messages.filter((msg) => msg._id.toString() !== messageId);
        await chat.save();

        // Emit deletion event
        const io = req.app.get("io");
        if (io) {
            io.to(chat._id.toString()).emit("message_deleted", { messageId, chatId: chat._id });
        }

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.userId || req.user._id;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // Verify user is a participant
        if (!chat.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({ success: false, message: "You are not a participant in this chat" });
        }

        await Chat.findByIdAndDelete(chatId);

        // Emit deletion event
        const io = req.app.get("io");
        if (io) {
            io.to(chatId).emit("chat_deleted", { chatId });
        }

        res.json({ success: true, message: "Chat deleted successfully" });
    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.user.userId || req.user._id;

        if (!chatId) {
            return res.status(400).json({ success: false, message: "Chat ID is required" });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // Verify user is a participant
        if (!chat.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({ success: false, message: "You are not a participant in this chat" });
        }

        chat.messages.forEach((message) => {
            if (!message.isRead && message.sender.toString() !== userId.toString()) {
                message.isRead = true;
            }
        });

        await chat.save();

        res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getUnreadMessages = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
        }

        const chats = await Chat.find({ participants: userId });

        if (!chats || chats.length === 0) {
            return res.status(200).json({ success: true, unreadMessages: [] });
        }

        let unreadMessages = [];
        for (const chat of chats) {
            const unread = chat.messages.filter(
                (msg) => !msg.isRead && msg.sender.toString() !== userId.toString()
            );

            if (unread.length > 0) {
                // Fetch sender data for unread messages
                const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
                const unreadWithSenders = await Promise.all(unread.map(async (msg) => {
                    const msgObj = msg.toObject();
                    if (token) {
                        try {
                            const sender = await AuthServiceClient.getUser(msg.sender, token);
                            msgObj.sender = sender;
                        } catch (error) {
                            console.error(`Error fetching sender:`, error);
                        }
                    }
                    return msgObj;
                }));

                unreadMessages.push({
                    chatId: chat._id,
                    messages: unreadWithSenders,
                });
            }
        }

        res.status(200).json({ success: true, unreadMessages });
    } catch (error) {
        console.error("Error fetching unread messages:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

/**
 * Get unread message count for a user
 */
export const getUnreadMessageCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.user.userId || req.user._id;

        // Users can only get their own unread count
        if (userId !== requestingUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own unread message count"
            });
        }

        const chats = await Chat.find({ participants: userId });

        if (!chats || chats.length === 0) {
            return res.json({ success: true, count: 0 });
        }

        let unreadCount = 0;
        for (const chat of chats) {
            const unread = chat.messages.filter(
                (msg) => !msg.isRead && msg.sender.toString() !== userId.toString()
            );
            unreadCount += unread.length;
        }

        res.json({ success: true, count: unreadCount });
    } catch (error) {
        console.error("Error fetching unread message count:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
