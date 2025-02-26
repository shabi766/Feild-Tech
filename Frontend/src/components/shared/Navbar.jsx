import React, { useEffect, useRef, useState, useContext } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Calendar, LogOut, User2, Plus, Search, Bell, MessageSquareCodeIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { SEARCH_API_END_POINT, USER_API_END_POINT, CHAT_API_END_POINT } from '../utils/constant';
import { setuser } from '@/redux/authSlice';
import axios from 'axios';
import NotificationComponent from './NotificationComponent';
import Chat from './Chat/chat';
import { ChatContext } from "@/context/ChatContext";
import socket from "@/components/shared/socket";

const Navbar = () => {

    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const { unreadMessages, setUnreadMessages, chats, setSelectedChat } = useContext(ChatContext);

    useEffect(() => {
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
            // ✅ Only add the new message if it's from someone else & it's unread
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
    }, [user]);

    const handleUnreadMessagesClick = async (chatId) => {
        try {
            // ✅ Mark the chat as read in the backend
            await axios.post(`${CHAT_API_END_POINT}/mark-as-read`, { chatId }, { withCredentials: true });

            // ✅ Update unread messages state by removing only this chat
            setUnreadMessages((prev) => prev.filter((chat) => chat.chatId !== chatId));

            // ✅ Select the chat and navigate to it
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

    const fetchSuggestions = async (searchTerm) => {
        if (searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await axios.get(`${SEARCH_API_END_POINT}/search`, {
                withCredentials: true,
                params: { query: searchTerm }
            });
            setSuggestions(res.data.length ? res.data : [{ name: "Not Found", type: "none" }]);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        fetchSuggestions(value);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion) => {
        switch (suggestion.type) {
            case 'job':
                navigate(`/admin/jobs/${suggestion.id}`);
                break;
            case 'client':
                navigate(`/admin/client/details/${suggestion.id}`);
                break;
            case 'project':
                navigate(`/admin/project/detail/${suggestion.id}`);
                break;
            default:
                console.error('Unknown suggestion type:', suggestion.type);
        }
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className='bg-gray-200'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16'>
                <div className="flex items-center gap-4">
                    <h1 className='text-2xl font-bold'>Feild<span className='text-[#f94550]'>Tech</span></h1>

                    {user && user.role === 'Recruiter' ? (
                        <div className='flex items-center ml-8'>
                            <div className="border-l-2 border-gray-300 h-10 mx-2 ml-3" />

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="link" className="text-teal-600 hover:text-teal-800">
                                        <Plus size={24} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-48 bg-white shadow-lg rounded-lg border border-gray-300 z-10'>
                                    <ul>
                                        <li className='border-b border-gray-300'>
                                            <Link to="/admin/clients/create" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Post Client</Link>
                                        </li>
                                        <li className='border-b border-gray-300'>
                                            <Link to="/admin/projects/create" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Post Project</Link>
                                        </li>
                                        <li className='border-b border-gray-300'>
                                            <Link to="/admin/jobs/create" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Post Jobs</Link>
                                        </li>
                                        <li>
                                            <Link to="/admin/companies/create" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Post Companies</Link>
                                        </li>
                                    </ul>
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="link" className="text-teal-600 hover:text-teal-800">Work</Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-48 bg-white shadow-lg rounded-lg border border-gray-300 z-10'>
                                    <ul>
                                        <li className='border-b border-gray-300'>
                                            <Link to="/admin/companies" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Companies</Link>
                                        </li>
                                        <li className='border-b border-gray-300'>
                                            <Link to="/admin/jobs" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Jobs</Link>
                                        </li>
                                        <li className='border-b border-gray-300'>
                                            <Link to="/admin/clients" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Clients</Link>
                                        </li>
                                        <li>
                                            <Link to="/admin/projects" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Projects</Link>
                                        </li>
                                    </ul>
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="link" className="text-teal-600 hover:text-teal-800">Workforce</Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-48 bg-white shadow-lg rounded-lg border border-gray-300 z-10'>
                                    <ul>
                                        <li className='border-b border-gray-300'>
                                            <Link to="/technicians/techs" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>All Technicians</Link>
                                        </li>
                                        <li className='border-b border-gray-300'>
                                            <Link to="/admin/talentpool" className='block p-2 hover:bg-gray-100 focus:bg-gray-100'>Talentpool</Link>
                                        </li>
                                    </ul>
                                </PopoverContent>
                            </Popover>

                            <div className="relative flex-grow mx-20 flex items-center" ref={searchRef}>
                                <input
                                    type="text"
                                    className="px-20 py-2 w-full max-w-lg border border-gray-300 rounded-full focus:outline-none"
                                    placeholder="Search jobs, clients, projects..."
                                    value={query}
                                    onChange={handleSearchChange}
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto z-10">
                                        {suggestions.map((suggestion) => (
                                            <li
                                                key={suggestion.id || suggestion.name}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion.name} {suggestion.type !== "none" && `(${suggestion.type})`}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/jobs">Jobs</Link></li>
                            <li><Link to="/browse">Browse</Link></li>
                        </>
                    )}
                </div>

                <div className='flex items-center gap-4'>


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
                                                        onClick={() => handleUnreadMessagesClick(chat._id)}  // ✅ Use fixed function
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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className='cursor-pointer'>
                                        <AvatarImage src={user?.profile?.profilePhoto || '/path/to/default-avatar.png'} alt={user.fullname} />
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className='w-48 bg-slate-100 shadow-lg rounded-lg border border-gray-300 z-10 '>
                                    <div className='flex gap-2 space-y-2 forced-color-adjust-auto'>
                                        <Avatar className='cursor-pointer'>
                                            <AvatarImage src={user?.profile?.profilePhoto || '/path/to/default-avatar.png'} alt={user.fullname} />
                                        </Avatar>
                                        <div>
                                            <h4 className='font-medium'>{user.fullname}</h4>
                                            <p className='text-xs text-gray-500'>{user.email}</p>
                                        </div>
                                    </div>
                                    <div className='py-2'>
                                        <Link to="/profile" className='flex items-center gap-2 py-2'>
                                            <User2 size={16} /> Profile
                                        </Link>
                                        <Link to="/calender" className='flex items-center gap-2 py-2'>
                                            <Calendar size={16} /> Calendar
                                        </Link>
                                        <button onClick={LogoutHandler} disabled={loading} className='flex items-center gap-2 py-2 w-full'>
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </>
                    )}
                </div>
            </div>
        </div>

    );
};

export default Navbar;
