import React, { useState, useContext } from "react";
import useChatSearch from "@/components/Hooks/useChatSearch"; 
import { ChatContext } from "@/context/ChatContext";
import { Search, UserCircle } from "lucide-react";

const ChatSidebar = () => {
    const { chats, setSelectedChat, currentUser, startChatWithUser } = useContext(ChatContext);
    const [searchQuery, setSearchQuery] = useState("");
    const { users, loading } = useChatSearch(searchQuery);

    return (
        <div className="w-1/4 bg-white border-r p-4 shadow-lg">
            {/* ✅ Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-2 top-2 text-gray-500" size={20} />
            </div>

            {/* ✅ Search Results */}
            {loading && <p className="text-center text-gray-500 mt-2">Searching...</p>}
            {users.length > 0 && (
                <ul className="mt-2 space-y-2">
                    {users.map(user => (
                        <li key={user._id} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => startChatWithUser(user._id)}>
                            <img src={user.profile?.profilePhoto || "/default-avatar.png"} alt="Profile" className="w-8 h-8 rounded-full mr-3" />
                            <span>{user.fullname}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* ✅ Existing Chats */}
            <h3 className="mt-4 font-semibold">Chats</h3>
            <ul className="space-y-2">
                {chats.map(chat => {
                    const recipient = chat.participants.find(p => p._id !== currentUser?._id);
                    return (
                        <li key={chat._id} onClick={() => setSelectedChat(chat)} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                            <img src={recipient?.profile?.profilePhoto || "/default-avatar.png"} alt="Profile" className="w-8 h-8 rounded-full mr-3" />
                            <span>{recipient?.fullname}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ChatSidebar;
