import React, { useState, useContext, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import {
    LogOut, UserCircle2, Settings, BellRing, MessageCircleMore,
    ChevronDown, Shield, Wrench, User, Inbox, CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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

// Role badge config
const roleBadgeConfig = {
    Recruiter: { label: 'Recruiter', icon: User, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    Technician: { label: 'Technician', icon: Wrench, gradient: 'from-cyan-500 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-700' },
    Admin: { label: 'Administrator', icon: Shield, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700' },
};

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

            const socket = getSocket();

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

        if (setLogoutFlag) {
            setLogoutFlag();
        }

        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || "Logout failed");
            }
        } finally {
            dispatch(logout());
            navigate("/login", { replace: true });
            setLoading(false);
        }
    };

    const roleConfig = roleBadgeConfig[user?.role] || roleBadgeConfig.Technician;
    const RoleIcon = roleConfig.icon;
    const userInitials = user?.fullname
        ? user.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/60'
                : 'bg-white/95 backdrop-blur-sm shadow-sm'
            }`}>
            <div className='flex items-center justify-between h-16 w-full px-4 lg:px-6'>
                {/* Left side - Logo and Navigation */}
                <div className="flex items-center gap-4 lg:gap-6">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img
                            src={logo}
                            alt="ShiftsMate Logo"
                            className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                        />
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        {leftContent || children}
                    </nav>
                </div>

                {/* Center - Content area */}
                <div className="flex-1 flex justify-center px-4">
                    {centerContent}
                </div>

                {/* Right side - User actions and menu */}
                <div className='flex items-center gap-1.5 lg:gap-2'>
                    {user && (
                        <>
                            {/* Messages */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className="relative p-2.5 rounded-xl transition-all duration-300 hover:bg-blue-50 group"
                                        title={t('unreadMessages')}
                                    >
                                        <MessageCircleMore
                                            size={20}
                                            className="text-gray-500 group-hover:text-blue-600 transition-colors duration-300"
                                            strokeWidth={1.8}
                                        />
                                        {unreadMessages.length > 0 && (
                                            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-md ring-2 ring-white animate-pulse">
                                                {unreadMessages.length > 9 ? '9+' : unreadMessages.length}
                                            </span>
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/50 z-50 p-0 overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-white">
                                        <div className="flex items-center gap-2">
                                            <MessageCircleMore size={18} className="text-blue-600" />
                                            <h3 className="font-semibold text-gray-800">{t('unreadMessages')}</h3>
                                        </div>
                                        {unreadMessages.length > 0 && (
                                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                {unreadMessages.length}
                                            </span>
                                        )}
                                    </div>
                                    {/* Body */}
                                    <div className="max-h-72 overflow-y-auto">
                                        {unreadMessages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 px-4">
                                                <div className="p-3 rounded-2xl bg-gray-100 mb-3">
                                                    <Inbox size={24} className="text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 text-sm font-medium">{t('noNewMessages')}</p>
                                                <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                                            </div>
                                        ) : (
                                            <ul>
                                                {chats
                                                    .filter((chat) => unreadMessages.some((msg) => msg.chatId === chat._id))
                                                    .map((chat) => {
                                                        const unread = unreadMessages.find(m => m.chatId === chat._id);
                                                        const otherUser = chat.participants.find((p) => p._id !== user._id);
                                                        return (
                                                            <li
                                                                key={chat._id}
                                                                onClick={() => handleUnreadMessagesClick(chat._id)}
                                                                className="px-4 py-3 hover:bg-blue-50/60 cursor-pointer flex items-center gap-3 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                                                            >
                                                                <div className="relative">
                                                                    <Avatar className="w-10 h-10 ring-2 ring-blue-100">
                                                                        <AvatarImage
                                                                            src={otherUser?.profilePhoto || "/default-avatar.png"}
                                                                            alt={otherUser?.fullname}
                                                                        />
                                                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                                                                            {otherUser?.fullname?.charAt(0) || '?'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                                                        {otherUser?.fullname}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 truncate">
                                                                        {chat.lastMessage?.content || t('newMessage')}
                                                                    </p>
                                                                </div>
                                                                {unread?.messages?.length > 0 && (
                                                                    <span className="min-w-[20px] h-5 bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                                                        {unread.messages.length}
                                                                    </span>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Notifications */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className="relative p-2.5 rounded-xl transition-all duration-300 hover:bg-amber-50 group"
                                        title={t('notifications') || 'Notifications'}
                                    >
                                        <BellRing
                                            size={20}
                                            className="text-gray-500 group-hover:text-amber-600 transition-colors duration-300"
                                            strokeWidth={1.8}
                                        />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className='w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/50 z-50 p-0 overflow-hidden'>
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50/80 to-white">
                                        <div className="flex items-center gap-2">
                                            <BellRing size={18} className="text-amber-600" />
                                            <h3 className="font-semibold text-gray-800">{t('notifications') || 'Notifications'}</h3>
                                        </div>
                                        <button className="text-xs text-gray-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors">
                                            <CheckCheck size={14} />
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        <NotificationComponent />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </>
                    )}

                    {!user ? (
                        <div className='flex items-center gap-2 relative group'>
                            <Link to="/login">
                                <Button
                                    variant="ghost"
                                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-300 font-medium px-4 py-2"
                                >
                                    {t('login')}
                                </Button>
                            </Link>
                            <Link to="/role-selection">
                                <Button className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-5 py-2 rounded-xl'>
                                    {t('signUp')}
                                </Button>
                            </Link>

                            {/* Hidden Admin Access Icon */}
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
                        /* Profile Popover */
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="cursor-pointer group ml-1">
                                    <div className="relative">
                                        <Avatar className='w-9 h-9 ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all duration-300 group-hover:scale-105'>
                                            <AvatarImage
                                                src={user?.profile?.profilePhoto}
                                                alt={user.fullname}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* Online indicator */}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                                    </div>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-white shadow-2xl rounded-2xl border border-gray-200/50 z-50 p-0 overflow-hidden">
                                {/* Profile header with gradient */}
                                <div className={`bg-gradient-to-r ${roleConfig.gradient} p-5 pb-4`}>
                                    <div className='flex gap-3 items-center'>
                                        <Avatar className='w-12 h-12 ring-2 ring-white/40 shadow-lg'>
                                            <AvatarImage
                                                src={user?.profile?.profilePhoto}
                                                alt={user.fullname}
                                            />
                                            <AvatarFallback className="bg-white/20 text-white text-sm font-bold">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className='font-semibold text-white text-base'>{user.fullname}</h4>
                                            <p className='text-sm text-white/80'>{user.email}</p>
                                        </div>
                                    </div>
                                    {/* Role badge */}
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                                        <RoleIcon size={12} className="text-white" />
                                        <span className="text-xs font-medium text-white">{roleConfig.label}</span>
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className='p-2'>
                                    <Link
                                        to={user.role === 'Recruiter' ?
                                            (user.recruiterType === 'Individual' || !user.companyId ?
                                                '/app/recruiter/profile' : '/app/recruiter/profile') :
                                            user.role === 'Technician' ? '/app/technician/profile' :
                                                user.role === 'Admin' ? '/app/administrator/profile' : '/profile'}
                                        className='flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 hover:text-blue-600 group/item'
                                    >
                                        <div className="p-1.5 rounded-lg bg-gray-100 group-hover/item:bg-blue-100 transition-colors">
                                            <UserCircle2 size={16} className="group-hover/item:text-blue-600 transition-colors" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm">{t('profile')}</span>
                                            <p className="text-xs text-gray-400">View and edit your profile</p>
                                        </div>
                                    </Link>
                                    <Link
                                        to={user.role === 'Recruiter' ?
                                            (user.recruiterType === 'Individual' || !user.companyId ?
                                                '/app/recruiter/settings' : '/app/recruiter/settings') :
                                            user.role === 'Technician' ? '/app/technician/settings' :
                                                user.role === 'Admin' ? '/app/administrator/settings' : '/settings'}
                                        className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 hover:text-blue-600 group/item"
                                    >
                                        <div className="p-1.5 rounded-lg bg-gray-100 group-hover/item:bg-blue-100 transition-colors">
                                            <Settings size={16} className="group-hover/item:text-blue-600 transition-colors" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm">{t('settings')}</span>
                                            <p className="text-xs text-gray-400">Preferences & account</p>
                                        </div>
                                    </Link>

                                    <div className="my-1.5 mx-3 border-t border-gray-100"></div>

                                    <button
                                        onClick={LogoutHandler}
                                        disabled={loading}
                                        className='flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-red-50 transition-all duration-200 text-gray-700 hover:text-red-600 w-full disabled:opacity-50 group/item'
                                    >
                                        <div className="p-1.5 rounded-lg bg-gray-100 group-hover/item:bg-red-100 transition-colors">
                                            <LogOut size={16} className="group-hover/item:text-red-600 transition-colors" />
                                        </div>
                                        <span className="font-medium text-sm">{loading ? t('loggingOut') : t('logout')}</span>
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