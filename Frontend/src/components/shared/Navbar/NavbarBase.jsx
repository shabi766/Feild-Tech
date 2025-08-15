import React, { useState, useContext, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { LogOut, User2, Settings, Bell, MessageSquareCodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { USER_API_END_POINT, CHAT_API_END_POINT } from '@/components/utils/constant';
import { logout } from '@/redux/authSlice';
import axios from 'axios';
import NotificationComponent from '@/components/shared/NotificationComponent';
import { ChatContext } from "@/context/ChatContext";
import { getSocket } from "@/components/shared/socket";
import logo from "@/assets/logo.png"
import { useTranslation } from '@/Hooks/useTranslation';

const NavbarBase = ({ children, leftContent, centerContent, user, setLogoutFlag }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAdminIcon, setShowAdminIcon] = useState(false);
    const { unreadMessages, setUnreadMessages, chats, setSelectedChat } = useContext(ChatContext);
    const { t } = useTranslation();

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

            const socket = getSocket(); // Get socket only when needed
            
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
        
        // Set logout flag to prevent unnecessary API calls
        if (setLogoutFlag) {
            setLogoutFlag();
        }
        
        try {
            // Try to call logout endpoint, but don't fail if it returns 401
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            // Don't show error for 401 (token expired) as this is expected during logout
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || "Logout failed");
            }
        } finally {
            // Always clear all authentication state and redirect regardless of API response
            dispatch(logout());
            
            // Force redirect to login page to avoid any routing issues
            navigate("/login", { replace: true });
            setLoading(false);
        }
    };

    return (
        <div className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/60' 
                : 'bg-white/95 backdrop-blur-sm shadow-sm'
        }`}>
            <div className='flex items-center justify-between h-16 w-full px-4 lg:px-6'>
                {/* Left side - Logo and Navigation */}
                <div className="flex items-center gap-4 lg:gap-6">
                    <div className="flex items-center gap-2 group">
                        <img 
                            src={logo} 
                            alt="ShiftsMate Logo" 
                            className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
                        />
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        {leftContent || children}
                    </nav>
                </div>

                {/* Center - Content area */}
                <div className="flex-1 flex justify-center px-4">
                    {centerContent}
                </div>

                {/* Right side - User actions and menu */}
                <div className='flex items-center gap-3 lg:gap-4'>
                    {user && (
                        <>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <div className="relative cursor-pointer group">
                                        <div className="p-2 rounded-full transition-all duration-300 group-hover:bg-gray-100/60 group-hover:scale-105">
                                            <MessageSquareCodeIcon 
                                                size={20} 
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
                                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">{t('unreadMessages')}</h3>
                                    {unreadMessages.length === 0 ? (
                                        <p className="text-gray-500 text-sm">{t('noNewMessages')}</p>
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
                                                                {chat.lastMessage?.content || t('newMessage')}
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
                                        <div className="p-2 rounded-full transition-all duration-300 group-hover:bg-gray-100/60 group-hover:scale-105">
                                            <Bell 
                                                size={20} 
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
                        <div className='flex items-center gap-3 relative group'>
                            <Link to="/login">
                                <Button 
                                    variant="ghost" 
                                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-300 font-medium px-4 py-2"
                                >
                                    {t('login')}
                                </Button>
                            </Link>
                            <Link to="/role-selection">
                                <Button className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2'>
                                    {t('signUp')}
                                </Button>
                            </Link>
                            
                            {/* Hidden Admin Access Icon - Only appears on hover */}
                            <div 
                                className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
                                onMouseEnter={() => setShowAdminIcon(true)}
                                onMouseLeave={() => setShowAdminIcon(false)}
                            >
                                <Link 
                                    to="/admin-login"
                                    className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 hover:scale-110"
                                    title={t('administratorAccess')}
                                >
                                    <Settings size={12} className="text-gray-500 hover:text-gray-700" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="cursor-pointer group">
                                    <Avatar className='cursor-pointer ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-300 group-hover:scale-105 w-9 h-9'>
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
                                        to={user.role === 'Recruiter' ? 
                                            (user.recruiterType === 'individual' || !user.companyId ? 
                                                '/app/recruiter/profile' : '/app/recruiter/profile') : 
                                            user.role === 'Technician' ? '/app/technician/profile' : 
                                            user.role === 'Admin' ? '/app/administrator/profile' : '/profile'} 
                                        className='flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600'
                                    >
                                        <User2 size={18} /> 
                                        <span className="font-medium">{t('profile')}</span>
                                    </Link>
                                    <Link 
                                        to={user.role === 'Recruiter' ? 
                                            (user.recruiterType === 'individual' || !user.companyId ? 
                                                '/app/recruiter/settings' : '/app/recruiter/settings') : 
                                            user.role === 'Technician' ? '/app/technician/settings' : 
                                            user.role === 'Admin' ? '/app/administrator/settings' : '/settings'} 
                                        className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600"
                                    >
                                        <Settings size={18} /> 
                                        <span className="font-medium">{t('settings')}</span>
                                    </Link>
                                    <button 
                                        onClick={LogoutHandler} 
                                        disabled={loading} 
                                        className='flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-red-50/80 transition-all duration-200 text-gray-700 hover:text-red-600 w-full disabled:opacity-50'
                                    >
                                        <LogOut size={18} /> 
                                        <span className="font-medium">{loading ? t('loggingOut') : t('logout')}</span>
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