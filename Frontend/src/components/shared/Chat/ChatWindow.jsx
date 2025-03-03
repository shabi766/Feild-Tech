import React, { useState, useContext, useEffect, useRef } from "react";
import { ChatContext } from "@/context/ChatContext";
import { Trash2, Eye, CheckCircle, Clock } from "lucide-react"; // Icon for delete button
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { CHAT_API_END_POINT } from "@/components/utils/constant";
const ChatWindow = () => {
    const { selectedChat,setSelectedChat, chats, messages, sendMessage, deleteMessage, currentUser, unreadMessages, setUnreadMessages } = useContext(ChatContext);
    const [searchParams] = useSearchParams();
    const chatId = searchParams.get("chatId");
    const [newMessage, setNewMessage] = useState("");
    const [showSeen, setShowSeen] = useState(false);
    const messageListRef = useRef(null);
    useEffect(() => {
        if (chatId) {
            const foundChat = chats.find(chat => chat._id === chatId);
            if (foundChat) {
                setSelectedChat(foundChat);
            }
        }
    }, [chatId, chats]);

    useEffect(() => {
        if (selectedChat) {
            axios.post(`${CHAT_API_END_POINT}/mark-as-read`, { chatId: selectedChat._id }, { withCredentials: true });

            // ✅ Remove chat from unread messages
            setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== selectedChat._id));
        }
    }, [selectedChat]);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    if (!selectedChat) {
        return <p className="text-center text-gray-5000">Select a chat to start messaging.</p>;
    }
    const recipient = selectedChat.participants.find((p) => p._id !== currentUser?._id);
    const recipientStatus = recipient?.status;

    return (
        <div className="w-3/4 p-4 flex flex-col bg-white shadow-md rounded-md">
            {/* ✅ Chat Header */}
            <div className="flex justify-between items-center p-3 bg-indigo-500 text-white rounded-md">
                <div className="flex items-center gap-3">
                    {/* ✅ Correctly Display the Profile Image */}
                    <img
                        src={selectedChat?.participants?.find(p => p?._id !== currentUser?._id)?.profile?.profilePhoto || "/default-avatar.png"}
                        alt="Recipient"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    {/* ✅ Correctly Display the Recipient's Name */}
                    <h2 className="text-lg font-semibold">
                        {selectedChat?.participants?.find(p => p?._id !== currentUser?._id)?.fullname}
                    </h2>
                </div>
                <p className="text-xs text-gray-400 font-medium tracking-wide">
                    {recipientStatus === "online" ? (
                        <span className="text-green-500 font-semibold">● Online</span>
                    ) : recipient?.lastSeen ? (
                        <span className="text-[10px]  text-white font-thin">
                            last seen: {new Date(recipient.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400">Last seen: Unknown</span>
                    )}
                </p>


            </div>


            {/* ✅ Messages List */}
            <div className="flex-grow overflow-y-auto p-2 space-y-2" ref={messageListRef}>
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">No messages yet.</p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex items-center gap-2 p-3 rounded-md max-w-[75%] relative group ${msg.sender?._id === currentUser?._id
                                ? 'bg-blue-500 text-white ml-auto'
                                : 'bg-gray-200 text-black mr-auto'
                                }`}
                        >
                            <div>
                                <p className="break-words">{msg.content}</p>
                                <div
                                    className="message-container"
                                    onClick={() => setShowSeen(true)} // ✅ Show seen icon when clicked
                                >
                                    <div className="flex items-center text-xs mt-1">
                                        {/* ✅ Display hours & minutes only (HH:MM AM/PM) */}
                                        <small className="text-xs opacity-70">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </small>
                                    </div>

                                    {/* ✅ Show Seen Icon ONLY when message is clicked */}
                                    {msg.sender?._id === currentUser?._id && showSeen && (
                                        <div className="ml-2">
                                            {msg.isRead ? (
                                                <Eye className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <CheckCircle className="text-green-400 mr-1" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ✅ Delete Message Button */}
                            {msg.sender?._id === currentUser?._id && (
                                <button
                                    onClick={() => deleteMessage(msg._id)}
                                    className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* ✅ Message Input */}
            <div className="flex items-center mt-2">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 mr-2"
                />
                <button
                    onClick={() => {
                        if (newMessage.trim() !== "") {
                            sendMessage(newMessage);
                            setNewMessage("");  // ✅ Clear input after sending
                        }
                    }}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
