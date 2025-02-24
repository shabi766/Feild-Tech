import React from "react";

const ChatMessage = ({ message, isCurrentUser }) => {
    return (
        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}>
            <div className={`p-3 rounded-lg max-w-xs ${isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                {message.type === "text" ? message.content : <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">View File</a>}
            </div>
        </div>
    );
};

export default ChatMessage;
