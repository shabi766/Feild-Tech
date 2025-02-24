import { Chat } from "../Models/chat.model.js";
import { User } from "../Models/user.model.js";
import mongoose from "mongoose";

export const createChat = async (req, res) => {
    try {
        const { userId, groupName, participantIds } = req.body;
        const currentUserId = req.user._id;

        if (!userId && !participantIds) {
            return res.status(400).json({ success: false, message: "User ID or participant IDs are required." });
        }

        let chat;
        if (groupName) {
            chat = new Chat({ participants: [currentUserId, ...participantIds], isGroupChat: true, groupName });
        } else {
            chat = await Chat.findOne({
                participants: { $all: [currentUserId, userId] },
                isGroupChat: false,
            });

            if (!chat) chat = new Chat({ participants: [currentUserId, userId], isGroupChat: false });
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
        const userId = req.user?._id;

        if (!chatId || !message || !userId) {
            return res.status(400).json({ message: "Missing required fields", success: false });
        }

        console.log("📩 Received message:", { chatId, message, type, fileUrl });

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found", success: false });
        }

        const newMessage = {
            sender: userId,
            content: message,
            type: type || "text",
            fileUrl: fileUrl || null,
        };

        chat.messages.push(newMessage);
        await chat.save();

        const populatedChat = await Chat.findById(chatId).populate("messages.sender", "fullname profile.profilePhoto");

        res.json({ message: populatedChat.messages.pop() }); // Return the last added message
    } catch (error) {
        console.error("❌ Error in sendMessage:", error);
        res.status(500).json({ message: "Server error", success: false });
    }
};



export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate("participants", "fullname profilePhoto")
            .sort({ updatedAt: -1 });

        res.json({ chats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId).populate("messages.sender", "fullname profilePhoto");
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        res.json({ messages: chat.messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const searchChats = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ success: false, message: "Search query is required." });

        const chats = await Chat.find({
            $or: [
                { groupName: { $regex: query, $options: "i" } },
                { "messages.content": { $regex: query, $options: "i" } }
            ]
        }).populate("participants", "fullname profile.profilePhoto");

        res.json({ success: true, chats });
    } catch (error) {
        console.error("Error searching chats:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        // Find the chat that contains this message
        const chat = await Chat.findOne({ "messages._id": messageId });
        if (!chat) return res.status(404).json({ success: false, message: "Message not found" });

        // Remove the message from the chat
        chat.messages = chat.messages.filter(msg => msg._id.toString() !== messageId);
        await chat.save();

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

        await Chat.findByIdAndDelete(chatId);

        res.json({ success: true, message: "Chat deleted successfully" });
    } catch (error) {
        console.error("Error deleting chat:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
