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
    const [isScrolled, setIsScrolled] = useState(false);
    const { unreadMessages, setUnreadMessages, chats, setSelectedChat } = useContext(ChatContext);

    // Handle scroll effect for navbar transparency
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
                : 'bg-transparent'
        }`}>
            <div className='flex items-center mx-auto max-w-7xl h-20 w-full px-6'>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group">
                        <img 
                            src={logo} 
                            alt="ShiftsMate Logo" 
                            className="h-12 transition-transform duration-300 group-hover:scale-105" 
                        />
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        {children}
                    </nav>
                </div>

                <div className='flex items-center gap-4 ml-auto'>
                    {user && (
                        <>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="relative cursor-pointer group">
                                        <div className="p-2 rounded-full transition-all duration-300 group-hover:bg-gray-100/50 group-hover:scale-110">
                                            <MessageSquareCodeIcon 
                                                size={22} 
                                                className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300" 
                                            />
                                        </div>
                                        {unreadMessages.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-lg">
                                                {unreadMessages.length}
                                            </span>
                                        )}
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/50 z-50 p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">Unread Messages</h3>
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
                                                        className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50/80 cursor-pointer flex items-center gap-3 transition-all duration-200 hover:shadow-sm"
                                                    >
                                                        <Avatar className="ring-2 ring-blue-100">
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
                                    <div className="relative cursor-pointer group">
                                        <div className="p-2 rounded-full transition-all duration-300 group-hover:bg-gray-100/50 group-hover:scale-110">
                                            <Bell 
                                                size={22} 
                                                className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300" 
                                            />
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='w-80 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/50 z-50'>
                                    <NotificationComponent />
                                </PopoverContent>
                            </Popover>
                        </>
                    )}

                    {!user ? (
                        <div className='flex items-center gap-3'>
                            <Link to="/Login">
                                <Button 
                                    variant="ghost" 
                                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 font-medium"
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link to="/Signup">
                                <Button className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium'>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="cursor-pointer group">
                                    <Avatar className='cursor-pointer ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-300 group-hover:scale-105'>
                                        <AvatarImage 
                                            src={user?.profile?.profilePhoto || '/path/to/default-avatar.png'} 
                                            alt={user.fullname} 
                                        />
                                    </Avatar>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/50 z-50 p-6">
                                <div className='flex gap-4 items-center mb-4 pb-4 border-b border-gray-100'>
                                    <Avatar className='cursor-pointer ring-2 ring-blue-100'>
                                        <AvatarImage 
                                            src={user?.profile?.profilePhoto || '/path/to/default-avatar.png'} 
                                            alt={user.fullname} 
                                        />
                                    </Avatar>
                                    <div>
                                        <h4 className='font-semibold text-gray-800'>{user.fullname}</h4>
                                        <p className='text-sm text-gray-500'>{user.email}</p>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Link 
                                        to="/profile" 
                                        className='flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600'
                                    >
                                        <User2 size={18} /> 
                                        <span className="font-medium">Profile</span>
                                    </Link>
                                    <Link 
                                        to="/settings" 
                                        className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600"
                                    >
                                        <Settings size={18} /> 
                                        <span className="font-medium">Settings</span>
                                    </Link>
                                    <button 
                                        onClick={LogoutHandler} 
                                        disabled={loading} 
                                        className='flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-red-50/80 transition-all duration-200 text-gray-700 hover:text-red-600 w-full disabled:opacity-50'
                                    >
                                        <LogOut size={18} /> 
                                        <span className="font-medium">{loading ? 'Logging out...' : 'Logout'}</span>
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