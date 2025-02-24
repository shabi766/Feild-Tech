import React, { useState, useContext, useEffect, useRef } from "react";
import { ChatContext } from "@/context/ChatContext";
import { Trash2 } from "lucide-react"; // Icon for delete button

const ChatWindow = () => {
    const { selectedChat, messages, sendMessage, deleteMessage, currentUser } = useContext(ChatContext);
    const [newMessage, setNewMessage] = useState("");
    const messageListRef = useRef(null);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    if (!selectedChat) {
        return <p className="text-center text-gray-500">Select a chat to start messaging.</p>;
    }

    return (
        <div className="w-3/4 p-4 flex flex-col bg-white shadow-md rounded-md">
            {/* ✅ Chat Header */}
            <div className="flex justify-between items-center p-3 bg-indigo-600 text-white rounded-md">
                <h2 className="text-lg font-semibold">
                    {selectedChat.participants.find(p => p._id !== currentUser?._id)?.fullname}
                </h2>
            </div>

            {/* ✅ Messages List */}
            <div className="flex-grow overflow-y-auto p-2 space-y-2" ref={messageListRef}>
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">No messages yet.</p>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg._id} 
                            className={`flex items-center gap-2 p-3 rounded-md max-w-[75%] relative group ${
                                msg.sender?._id === currentUser?._id 
                                    ? 'bg-blue-500 text-white ml-auto' 
                                    : 'bg-gray-200 text-black mr-auto'
                            }`}
                        >
                            <p className="break-words">{msg.content}</p>
                            
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
