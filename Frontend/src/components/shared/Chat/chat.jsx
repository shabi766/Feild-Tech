import React, { useState, useContext } from "react";
import { ChatContext } from "@/context/ChatContext";
import { AudioCallProvider } from "@/context/AudioCallContext";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import AudioCallModal from "./AudioCallModal";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Chat = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AudioCallProvider>
            <div className="flex h-screen bg-gray-100">
                {/* Mobile Sidebar Toggle */}
                <div className="lg:hidden fixed top-4 left-4 z-40">
                    <Button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        variant="outline"
                        size="sm"
                        className="bg-white shadow-md"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>

                {/* Sidebar */}
                <div className={`
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                    fixed lg:relative
                    inset-y-0 left-0 z-30
                    transition-transform duration-300 ease-in-out
                `}>
                    <ChatSidebar />
                </div>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Chat Window */}
                <div className="flex-1 flex flex-col min-w-0">
                    <ChatWindow />
                </div>

                {/* Audio Call Modal */}
                <AudioCallModal />
            </div>
        </AudioCallProvider>
    );
};

export default Chat;
