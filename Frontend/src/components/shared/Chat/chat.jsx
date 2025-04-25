import React, { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import  { ChatProvider } from "@/context/ChatContext";

const Chat = () => {
    return (
        <ChatProvider>
            <div className="flex h-screen bg-gray-50">
                <ChatSidebar />
                <ChatWindow />
            </div>
        </ChatProvider>
    );
};

export default Chat;
