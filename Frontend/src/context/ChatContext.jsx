import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CHAT_API_END_POINT, USER_API_END_POINT } from "@/components/utils/constant";
import socket from "../components/shared/socket";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]); 
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]); 
    const [currentUser, setCurrentUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    /** ✅ Fetch Logged-in User */
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axios.get(`${USER_API_END_POINT}/me`, { withCredentials: true });
                setCurrentUser(data?.user || null);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    /** ✅ Fetch User Chats */
    const fetchChats = useCallback(async () => {
        try {
            const { data } = await axios.get(`${CHAT_API_END_POINT}/all`, { withCredentials: true });
            setChats(data?.chats || []);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    }, []);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    /** ✅ Fetch Messages for Selected Chat */
    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            try {
                const { data } = await axios.get(`${CHAT_API_END_POINT}/${selectedChat._id}`, { withCredentials: true });
                setMessages(data?.messages || []);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();

        socket.emit("join_chat", selectedChat._id);

        socket.on("new_message", (message) => {
            if (message.chatId === selectedChat?._id) {
                setMessages((prev) => [...prev, message]);
            }
        });

        socket.on("typing", () => setIsTyping(true));
        socket.on("stop_typing", () => setIsTyping(false));

        return () => {
            socket.off("new_message");
            socket.off("typing");
            socket.off("stop_typing");
        };
    }, [selectedChat]);

    /** ✅ Handle Sending Message */
    const sendMessage = async (content) => {
        if (!selectedChat || !content.trim()) return;

        try {
            const { data } = await axios.post(`${CHAT_API_END_POINT}/send`, {
                chatId: selectedChat._id,
                message: content,
                type: "text",
                fileUrl: null,
            }, { withCredentials: true });

            setMessages((prev) => [...prev, data.message]); // Show message immediately
            socket.emit("send_message", data.message);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    /** ✅ Start Chat with a New User */
    const startChatWithUser = async (userId) => {
        try {
            const { data } = await axios.post(`${CHAT_API_END_POINT}/create`, { userId }, { withCredentials: true });

            if (!chats.some(chat => chat._id === data.chat._id)) {
                setChats((prev) => [...prev, data.chat]);
            }

            setSelectedChat(data.chat);
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };

    return (
        <ChatContext.Provider value={{
            chats,
            setChats, 
            selectedChat,
            setSelectedChat,
            messages,
            setMessages,
            currentUser,
            isTyping,
            sendMessage,
            startChatWithUser,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatProvider;
