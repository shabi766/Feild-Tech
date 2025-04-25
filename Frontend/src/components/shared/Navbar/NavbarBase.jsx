import React, { useState, useContext, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { LogOut, User2, Settings, Bell, MessageSquareCodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { USER_API_END_POINT, CHAT_API_END_POINT } from '@/components/utils/constant';
import { setuser } from '@/redux/authSlice';
import axios from 'axios';
import NotificationComponent from '@/components/shared/NotificationComponent';
import { ChatContext } from "@/context/ChatContext";
import socket from "@/components/shared/socket";
import logo from "@/assets/logo.png"

const NavbarBase = ({ children, user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { unreadMessages, setUnreadMessages, chats, setSelectedChat } = useContext(ChatContext);

    useEffect(() => {
        if (user) {
            const fetchUnreadMessages = async () => {
                try {
                    const { data } = await axios.get(`${CHAT_API_END_POINT}/unread-messages`, { withCredentials: true });
                    if (data.success) {
                        setUnreadMessages(data.unreadMessages);
                    }
                } catch (error) {
                    console.error("Error fetching unread messages:", error);
                }
            };

            fetchUnreadMessages();

            socket.on("new_message", (message) => {
                if (message.sender !== user._id) {
                    setUnreadMessages((prev) => {
                        const existingChat = prev.find((chat) => chat.chatId === message.chatId);
                        if (existingChat) {
                            return prev.map((chat) =>
                                chat.chatId === message.chatId
                                    ? { ...chat, messages: [...chat.messages, message] }
                                    : chat
                            );
                        } else {
                            return [...prev, { chatId: message.chatId, messages: [message] }];
                        }
                    });
                }
            });

            return () => {
                socket.off("new_message");
            };
        }
    }, [user]);

    const handleUnreadMessagesClick = async (chatId) => {
        try {
            await axios.post(`${CHAT_API_END_POINT}/mark-as-read`, { chatId }, { withCredentials: true });
            setUnreadMessages((prev) => prev.filter((chat) => chat.chatId !== chatId));
            const selectedChat = chats.find((chat) => chat._id === chatId);
            setSelectedChat(selectedChat);
            navigate(`/chat?chatId=${chatId}`);
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    const LogoutHandler = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${USER_API_END_POINT}/Logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setuser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-blue-400'>
            <div className='flex items-center mx-auto max-w-7xl h-16 w-full px-4'>
                <div className="flex items-center gap-4">
                    <img src={logo} alt="ShiftsMate Logo" className="h-14" />
                    {children}
                </div>

                <div className='flex items-center gap-4 ml-auto'>
                    {user && (
                        <>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="relative cursor-pointer">
                                        <MessageSquareCodeIcon size={24} className="text-teal-600 hover:text-teal-800" />
                                        {unreadMessages.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                                {unreadMessages.length}
                                            </span>
                                        )}
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-white shadow-lg rounded-lg border border-gray-300 z-10 p-4">
                                    <h3 className="font-semibold text-gray-700 mb-2">Unread Messages</h3>
                                    {unreadMessages.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No new messages</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {chats
                                                .filter((chat) => unreadMessages.some((msg) => msg.chatId === chat._id))
                                                .map((chat) => (
                                                    <li
                                                        key={chat._id}
                                                        onClick={() => handleUnreadMessagesClick(chat._id)}
                                                        className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                                                    >
                                                        <Avatar>
                                                            <AvatarImage
                                                                src={
                                                                    chat.participants.find((p) => p._id !== user._id)?.profilePhoto ||
                                                                    "/default-avatar.png"
                                                                }
                                                                alt="User"
                                                            />
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">
                                                                {chat.participants.find((p) => p._id !== user._id)?.fullname}
                                                            </p>
                                                            <p className="text-sm text-gray-600 truncate w-48">
                                                                {chat.lastMessage?.content || "New message..."}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="link" className="text-teal-600 hover:text-teal-800">
                                        <Bell size={24} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-80 bg-white shadow-lg rounded-lg border border-gray-300 z-10'>
                                    <NotificationComponent />
                                </PopoverContent>
                            </Popover>
                        </>
                    )}

                    {!user ? (
                        <div className='flex items-center gap-2'>
                            <Link to="/Login">
                                <Button variant="outline">Login</Button>
                            </Link>
                            <Link to="/Signup">
                                <Button className='bg-teal-600 hover:bg-teal-700'>Signup</Button>
                            </Link>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className='cursor-pointer'>
                                    <AvatarImage src={user?.profile?.profilePhoto || '/path/to/default-avatar.png'} alt={user.fullname} />
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-white shadow-lg rounded-lg border border-gray-300 z-10 p-4">
                                <div className='flex gap-2 space-y-2 forced-color-adjust-auto'>
                                    <Avatar className='cursor-pointer'>
                                        <AvatarImage src={user?.profile?.profilePhoto || '/path/to/default-avatar.png'} alt={user.fullname} />
                                    </Avatar>
                                    <div>
                                        <h4 className='font-medium'>{user.fullname}</h4>
                                        <p className='text-xs text-gray-500'>{user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className='py-2'>
                                    <Link to="/profile" className='flex items-center gap-2 py-2'>
                                        <User2 size={16} /> Profile
                                    </Link>
                                    <Link to="/settings" className="flex items-center gap-2 py-2">
                                        <Settings size={16} /> Settings
                                    </Link>

                                    <button onClick={LogoutHandler} disabled={loading} className='flex items-center gap-2 py-2 w-full'>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavbarBase;