import React, { useState, useContext, useEffect, useRef } from "react";
import useChatSearch from "@/components/Hooks/useChatSearch";
import { ChatContext } from "@/context/ChatContext";
import { useAudioCall } from "@/context/AudioCallContext";
import { Trash2, Circle, Search, Plus, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const ChatSidebar = () => {
    const { chats, setSelectedChat, startChatWithUser, deleteChat, currentUser, userStatus, unreadMessages } = useContext(ChatContext);
    const { initiateCall } = useAudioCall();
    const [searchQuery, setSearchQuery] = useState("");
    const { users, loading } = useChatSearch(searchQuery);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    /** ✅ Hide suggestions when clicking outside */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /** ✅ Handle User Selection */
    const handleSelectUser = async (user) => {
        setSearchQuery("");
        setShowSuggestions(false);
        await startChatWithUser(user._id);
    };

    /** ✅ Get unread count for a chat */
    const getUnreadCount = (chatId) => {
        const unreadChat = unreadMessages.find(chat => chat.chatId === chatId);
        return unreadChat ? unreadChat.messages.length : 0;
    };

    /** ✅ Get last message preview */
    const getLastMessage = (chat) => {
        if (chat.messages && chat.messages.length > 0) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            return lastMsg.content.length > 30
                ? lastMsg.content.substring(0, 30) + "..."
                : lastMsg.content;
        }
        return "No messages yet";
    };

    /** ✅ Get last message time */
    const getLastMessageTime = (chat) => {
        if (chat.messages && chat.messages.length > 0) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const date = new Date(lastMsg.createdAt);
            const now = new Date();
            const diffInHours = (now - date) / (1000 * 60 * 60);

            if (diffInHours < 24) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (diffInHours < 48) {
                return 'Yesterday';
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        }
        return "";
    };

    /** ✅ Handle audio call */
    const handleAudioCall = async (recipient, e) => {
        e.stopPropagation();
        try {
            await initiateCall(recipient);
        } catch (error) {
            console.error('Error initiating call:', error);
            toast.error('Failed to start call');
        }
    };

    /** ✅ Get recipient from chat */
    const getRecipient = (chat) => {
        if (!currentUser || !chat.participants) return null;

        // Find the participant that is not the current user
        const recipient = chat.participants.find(p => p._id !== currentUser._id);

        // If no recipient found, try to find by userId field
        if (!recipient && chat.participants.length > 0) {
            return chat.participants[0];
        }

        return recipient;
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 gradient-accent">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Messages</h2>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Plus size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <MoreVertical size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
                <div className="relative" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        type="text"
                        placeholder="Search users or messages..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500 transition-all duration-200"
                    />

                    {/* Search Suggestions */}
                    {showSuggestions && users.length > 0 && (
                        <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-64 overflow-y-auto">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={user.profile?.profilePhoto} />
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                            {user.fullname?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{user.fullname}</p>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {chats.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400" size={24} />
                            </div>
                            <p className="text-gray-500 text-sm">No conversations yet</p>
                            <p className="text-gray-400 text-xs mt-1">Start a new chat to begin messaging</p>
                        </div>
                    ) : (
                        chats.map((chat) => {
                            if (!currentUser) return null;

                            const recipient = getRecipient(chat);
                            if (!recipient) return null;

                            const unreadCount = getUnreadCount(chat._id);
                            const isOnline = userStatus[recipient._id] === "online";

                            return (
                                <div
                                    key={chat._id}
                                    className="group relative p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                    onClick={() => setSelectedChat(chat)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar with online status */}
                                        <div className="relative">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={recipient.profile?.profilePhoto} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                                    {recipient.fullname?.charAt(0).toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isOnline && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>

                                        {/* Chat info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {recipient.fullname || recipient.username || "Unknown User"}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {getLastMessageTime(chat)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate mt-1">
                                                {getLastMessage(chat)}
                                            </p>
                                        </div>

                                        {/* Unread badge */}
                                        {unreadCount > 0 && (
                                            <Badge variant="destructive" className="ml-2">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Action buttons on hover */}
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                                            onClick={(e) => handleAudioCall(recipient, e)}
                                            title="Audio Call"
                                        >
                                            <Phone size={14} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toast.info("Video calls coming soon!");
                                            }}
                                            title="Video Call"
                                        >
                                            <Video size={14} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChat(chat._id);
                                            }}
                                            title="Delete Chat"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;
