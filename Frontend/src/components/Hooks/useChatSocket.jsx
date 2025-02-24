import { useEffect } from "react";
import socket from "../shared/socket";
import { useContext } from "react";
import { ChatContext } from "@/context/ChatContext";

const useChatSocket = () => {
    const { setMessages, selectedChat } = useContext(ChatContext);

    useEffect(() => {
        socket.on("receive_message", (message) => {
            if (selectedChat?._id === message.chatId) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            socket.off("receive_message");
        };
    }, [selectedChat, setMessages]);
};

export default useChatSocket;
