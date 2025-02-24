import React, { useState, useContext, useEffect, useRef } from "react";
import { ChatContext } from "@/context/ChatContext";

const ChatWindow = () => {
    const { selectedChat, messages, sendMessage, currentUser } = useContext(ChatContext);
    const [newMessage, setNewMessage] = useState("");
    const messageListRef = useRef(null);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    return selectedChat ? (
        <div className="w-3/4 p-4 flex flex-col">
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">{selectedChat.participants.find(p => p._id !== currentUser?._id)?.fullname}</h2>

            <div className="flex-grow overflow-y-auto p-2" ref={messageListRef}>
                {messages.map(msg => (
                    <div key={msg._id} className={`p-2 rounded-md mb-2 ${msg.sender._id === currentUser?._id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
                        {msg.message}
                    </div>
                ))}
            </div>

            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="w-full p-2 border rounded-md" />
            <button onClick={() => sendMessage(newMessage)} className="bg-indigo-500 text-white p-2 rounded-md">Send</button>
        </div>
    ) : <p className="text-center text-gray-500">Select a chat</p>;
};

export default ChatWindow;
