import React, { useContext } from "react";
import { ChatContext } from "@/context/ChatContext";
import { MoreVertical } from "lucide-react";

const ChatHeader = () => {
    const { selectedChat } = useContext(ChatContext);

    return (
        <div className="border-b border-blue-300 p-4 bg-blue-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{selectedChat?.isGroupChat ? selectedChat?.groupName : "Chat"}</h2>
            <MoreVertical className="h-5 w-5 text-gray-500 cursor-pointer" />
        </div>
    );
};

export default ChatHeader;
