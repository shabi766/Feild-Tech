import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CHAT_API_END_POINT, USER_API_END_POINT } from "@/components/utils/constant";
import socket from "../components/shared/socket";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]); // Store user chats
    const [selectedChat, setSelectedChat] = useState(null); // Store selected chat
    const [messages, setMessages] = useState([]); // Store messages of selected chat
    const [currentUser, setCurrentUser] = useState(null); // Store logged-in user
    const [isTyping, setIsTyping] = useState(false); // Track typing status
    const [searchResults, setSearchResults] = useState([]); // Store searched users
    const [userStatus, setUserStatus] = useState({}); // ✅ Stores user online status
    const [unreadMessages, setUnreadMessages] = useState([]);
    

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
                await axios.post(`${CHAT_API_END_POINT}/mark-as-read`, { chatId: selectedChat._id }, { withCredentials: true });
                socket.emit("read_messages", selectedChat._id);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();

        // Join chat room with socket
        socket.emit("join_chat", selectedChat._id);

        socket.on("new_message", (message) => {
            if (message.chatId === selectedChat._id) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            socket.off("new_message");
        };
    }, [selectedChat]);

    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const { data } = await axios.get(`${CHAT_API_END_POINT}/unread-messages`, { withCredentials: true });
                setUnreadMessages(data.unreadMessages || []);
            } catch (error) {
                console.error("Error fetching unread messages:", error);
            }
        };
    
        fetchUnreadMessages();
    
        socket.on("new_message", (message) => {
            setUnreadMessages((prev) => {
                // Avoid duplicates & only add new unread messages
                if (!prev.find((m) => m.chatId === message.chatId)) {
                    return [...prev, { chatId: message.chatId, messages: [message] }];
                }
                return prev;
            });
        });
    
        return () => {
            socket.off("new_message");
        };
    }, []);
    
    /** ✅ Handle Searching Users */
    const searchUsers = async (query) => {
        try {
            const { data } = await axios.get(`${USER_API_END_POINT}/search-users?query=${query}`, { withCredentials: true });
            setSearchResults(data || []);
        } catch (error) {
            console.error("Error searching users:", error);
        }
    };

    /** ✅ Handle Starting a New Chat */
    const startChatWithUser = async (userId) => {
        try {
            const { data } = await axios.post(
                `${CHAT_API_END_POINT}/create`,
                { userId },
                { withCredentials: true }
            );
    
            if (!data.chat) {
                console.error("❌ No chat returned from API response!");
                return null;
            }
    
            setChats((prev) => {
                const chatExists = prev.some(chat => chat._id === data.chat._id);
                return chatExists ? prev : [...prev, data.chat];
            });
    
            setSelectedChat(data.chat);  // ✅ Set the selected chat
            return data.chat;  // ✅ Return the created chat
        } catch (error) {
            console.error("❌ Error starting chat:", error.response?.data?.message || error.message);
            return null;
        }
    };
    
      /** ✅ Handle Online Status */
      useEffect(() => {
        socket.on("user_online", (userId) => {
            setUserStatus((prev) => ({ ...prev, [userId]: "online" }));
        });

        socket.on("user_offline", ({ userId, lastSeen }) => {
            setUserStatus((prev) => ({ ...prev, [userId]: `Last seen ${lastSeen}` }));
        });

        return () => {
            socket.off("user_online");
            socket.off("user_offline");
        };
    }, []);
    const sendMessage = async (content, type = "text", fileUrl = null) => {
        if (!selectedChat) {
            console.error("❌ Cannot send message: No chat selected.");
            return;
        }
    
        try {
            const { data } = await axios.post(`${CHAT_API_END_POINT}/send`, {
                chatId: selectedChat._id,
                message: content,
                type,
                fileUrl,
            }, { withCredentials: true });
    
            // ✅ Update state with new message
            setMessages((prev) => [...prev, data.message]);
    
            // ✅ Emit event for real-time updates
            socket.emit("send_message", data.message);
        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    };
    const deleteMessage = async (messageId) => {
        try {
            await axios.delete(`${CHAT_API_END_POINT}/message/${messageId}`, { withCredentials: true });

            // Remove the deleted message from state
            setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    /** ✅ Delete an Entire Chat */
    const deleteChat = async (chatId) => {
        try {
            await axios.delete(`${CHAT_API_END_POINT}/chat/${chatId}`, { withCredentials: true });

            // Remove the deleted chat from state
            setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));

            // Reset selected chat if it was deleted
            if (selectedChat?._id === chatId) {
                setSelectedChat(null);
                setMessages([]);
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    return (
        <ChatContext.Provider value={{
            chats,
            fetchChats,
            selectedChat,
            setSelectedChat,
            messages,
            sendMessage,
            currentUser,
            searchResults,
            searchUsers,
            startChatWithUser,
            deleteMessage,
            deleteChat, 
            userStatus,
            unreadMessages,
            setUnreadMessages

        }}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;
