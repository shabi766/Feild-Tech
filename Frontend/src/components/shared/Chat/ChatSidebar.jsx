import React, { useState, useContext, useEffect, useRef } from "react";
import useChatSearch from "@/components/Hooks/useChatSearch"; 
import { ChatContext } from "@/context/ChatContext";
import { Trash2 } from "lucide-react"; // Delete icon

const ChatSidebar = () => {
    const { chats, setSelectedChat, startChatWithUser, deleteChat, currentUser } = useContext(ChatContext);
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

    return (
        <div className="w-1/4 bg-white border-r p-4">
            {/* ✅ Search Input */}
            <div className="relative" ref={searchRef}>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />

                {/* ✅ Show Suggestions */}
                {showSuggestions && users.length > 0 && (
                    <ul className="absolute w-full bg-white border rounded-md shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                        {users.map((user) => (
                            <li
                                key={user._id}
                                onClick={() => handleSelectUser(user)}
                                className="p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-100"
                            >
                                <img src={user.profile?.profilePhoto || "/default-avatar.png"} 
                                     alt={user.fullname} 
                                     className="w-8 h-8 rounded-full" />
                                <span>{user.fullname}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ✅ Existing Chats */}
            <h3 className="mt-4 font-semibold text-gray-700">Chats</h3>
            <ul>
                {chats.map((chat) => {
                    if (!currentUser) return null;
                    const recipient = chat.participants.find(p => p._id !== currentUser?._id);
                    return (
                        <li key={chat._id} 
                            className="p-2 flex items-center gap-3 justify-between cursor-pointer hover:bg-gray-100 rounded-md">
                            <div className="flex items-center">
                                <img src={recipient?.profile?.profilePhoto || "/default-avatar.png"} 
                                     alt={recipient?.fullname || "User"} 
                                     className="w-8 h-8 rounded-full" />
                                <span onClick={() => setSelectedChat(chat)} className="ml-2">{recipient?.fullname || "Unknown User"}</span>
                            </div>
                            
                            {/* ✅ Delete Chat Button */}
                            <button 
                                onClick={() => deleteChat(chat._id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={18} />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ChatSidebar;
