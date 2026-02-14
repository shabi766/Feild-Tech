import React, { useState, useContext, useEffect, useRef } from "react";
import { ChatContext } from "@/context/ChatContext";
import { useAudioCall } from "@/context/AudioCallContext";
import { Trash2, Eye, CheckCircle, Clock, Send, Paperclip, Smile, MoreVertical, Phone, Video, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { CHAT_API_END_POINT } from "@/components/utils/constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import EmojiPicker from "./EmojiPicker";
import FileUpload from "./FileUpload";
import ChatMessage from "./ChatMessage";

const ChatWindow = () => {
    const { selectedChat, setSelectedChat, chats, messages, sendMessage, deleteMessage, currentUser, unreadMessages, setUnreadMessages, fetchChats } = useContext(ChatContext);
    const { initiateCall } = useAudioCall();
    const [searchParams] = useSearchParams();
    const chatId = searchParams.get("chatId");
    const [newMessage, setNewMessage] = useState("");
    const [showSeen, setShowSeen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messageListRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (chatId) {
            const foundChat = chats.find(chat => chat._id === chatId);
            if (foundChat) {
                setSelectedChat(foundChat);
            } else {
                // Ensure latest chats data
                fetchChats();
            }
        }
    }, [chatId, chats]);

    useEffect(() => {
        if (selectedChat) {
            const markAsRead = async () => {
                try {
                    await axios.post(`${CHAT_API_END_POINT}/mark-as-read`, { chatId: selectedChat._id }, { withCredentials: true });
                    // Update local unread count immediately for better UX
                    setUnreadMessages((prev) => prev.filter((msg) => msg.chatId !== selectedChat._id));
                } catch (error) {
                    console.error("Error marking messages as read:", error);
                }
            };
            markAsRead();
        }
    }, [selectedChat, messages]); // Re-run when new messages arrive in the selected chat

    // Play notification sound for new messages if not in current chat
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender?._id !== currentUser?._id && document.hidden) {
                // Play sound or show browser notification here if implemented
            }
        }
    }, [messages, currentUser]);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle typing indicator
    const handleTyping = () => {
        setIsTyping(true);
        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            setIsTyping(false);
        }, 1000);

        setTypingTimeout(timeout);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() !== "") {
            sendMessage(newMessage);
            setNewMessage("");
            setIsTyping(false);
            if (typingTimeout) clearTimeout(typingTimeout);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Handle emoji selection
    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Handle file selection
    const handleFileSelect = async (files) => {
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('chatId', selectedChat._id);

                // Upload file to S3
                const uploadResponse = await axios.post(
                    `${CHAT_API_END_POINT}/upload-file`,
                    formData,
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                if (uploadResponse.data.success) {
                    const fileUrl = uploadResponse.data.fileUrl;
                    const fileName = file.name;

                    // Send message with file URL
                    sendMessage(`📎 ${fileName}`, 'file', fileUrl);
                    toast.success(`File "${fileName}" sent successfully!`);
                }
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file. Please try again.');
        }
    };

    // Resolve recipient robustly
    const getRecipient = () => {
        if (!selectedChat || !currentUser) return null;
        const populated = selectedChat.participants?.find(p => p?._id && p._id !== currentUser._id);
        if (populated) return populated;
        // Fallback: find the same chat from populated chats list
        const chatFromList = chats.find(c => c._id === selectedChat._id);
        return chatFromList?.participants?.find(p => p?._id && p._id !== currentUser._id) || null;
    };

    const recipient = getRecipient();
    const recipientStatus = recipient?.status;

    // Delete handler passthrough
    const handleDeleteMessage = (messageId) => deleteMessage(messageId);

    return (
        <div className="flex-1 flex flex-col bg-white h-screen">
            {/* Chat Header - Fixed at top */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={recipient?.profile?.profilePhoto} />
                        <AvatarFallback className="bg-accent/20 text-accent">
                            {recipient?.fullname?.charAt(0).toUpperCase() || recipient?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {recipient?.fullname || recipient?.username || "Unknown User"}
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${recipientStatus === "online" ? "bg-green-500" : "bg-gray-400"}`}></div>
                            <span className="text-sm text-gray-500">
                                {recipientStatus === "online" ? "Online" :
                                    recipient?.lastSeen ?
                                        `Last seen ${new Date(recipient.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                                        "Offline"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-green-100 hover:text-green-600"
                        onClick={async () => recipient && await initiateCall(recipient)}
                        title="Audio Call"
                    >
                        <Phone size={18} />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-blue-100 hover:text-blue-600"
                        onClick={() => toast.info("Video calls coming soon!")}
                        title="Video Call"
                    >
                        <Video size={18} />
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                        <Search size={18} />
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                        <MoreVertical size={18} />
                    </Button>
                </div>
            </div>

            {/* Messages Area - Scrollable, takes remaining space */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4" ref={messageListRef}>
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400" size={24} />
                            </div>
                            <p className="text-gray-500 text-sm">No messages yet</p>
                            <p className="text-gray-400 text-xs mt-1">Start the conversation by sending a message</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isCurrentUser = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                            return (
                                <ChatMessage
                                    key={msg._id || `${msg.createdAt}-${index}`}
                                    message={msg}
                                    isCurrentUser={isCurrentUser}
                                    recipient={recipient}
                                    onDelete={handleDeleteMessage}
                                />
                            );
                        })
                    )}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex items-end gap-2 justify-start">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src={recipient?.profile?.profilePhoto} />
                                <AvatarFallback className="bg-accent/20 text-accent text-xs">
                                    {recipient?.fullname?.charAt(0).toUpperCase() || recipient?.username?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyPress={handleKeyPress}
                            className="pr-12 py-3 border-gray-300 focus:border-primary focus:ring-primary resize-none"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <FileUpload onFileSelect={handleFileSelect} />
                            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                        </div>
                    </div>
                    <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
