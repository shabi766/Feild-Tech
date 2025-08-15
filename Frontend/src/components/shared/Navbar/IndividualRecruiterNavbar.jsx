import React, { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Plus, Search, Users, Briefcase, UserPlus, FileText, Calendar, Settings, Wallet, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEARCH_API_END_POINT } from '@/components/utils/constant';
import axios from 'axios';
import NavbarBase from './NavbarBase';
import { Button } from '@/components/ui/button';

const IndividualRecruiterNavbar = ({ user, setLogoutFlag }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

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
                navigate(`/app/recruiter/jobs/${suggestion.id}`);
                break;
            case 'technician':
                navigate(`/app/recruiter/technicians/${suggestion.id}`);
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

    const createMenuItems = [
        { path: '/app/recruiter/jobs/create-simple', label: 'Post Job', icon: Briefcase },
        { path: '/app/recruiter/technicians/techs', label: 'Browse Technicians', icon: Users }
    ];

    const workMenuItems = [
        { path: '/app/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
        { path: '/app/recruiter/jobcalender', label: 'Job Calendar', icon: Calendar },
        { path: '/app/recruiter/applicants', label: 'Applicants', icon: UserPlus }
    ];

    const workforceMenuItems = [
        { path: '/app/recruiter/technicians/techs', label: 'All Technicians', icon: Users },
        { path: '/app/recruiter/talentpool', label: 'Talent Pool', icon: Users }
    ];

    const toolsMenuItems = [
        { path: '/app/recruiter/chat', label: 'Messages', icon: MessageCircle },
        { path: '/app/recruiter/settings', label: 'Settings', icon: Settings },
        { path: '/app/recruiter/wallets', label: 'Wallet', icon: Wallet }
    ];

    return (
        <NavbarBase 
            user={user}
            setLogoutFlag={setLogoutFlag}
            leftContent={
                <div className="flex items-center gap-2">
                    {/* Create Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-300 font-medium text-sm px-3 py-2"
                            >
                                <Plus size={18} />
                                <span>Create</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-56 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/60 z-50 p-2'>
                            <ul className="space-y-1">
                                {createMenuItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <li key={item.path}>
                                            <Link 
                                                to={item.path} 
                                                className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600'
                                            >
                                                <IconComponent size={18} />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </PopoverContent>
                    </Popover>

                    {/* Work Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-300 font-medium text-sm px-3 py-2"
                            >
                                <Briefcase size={18} />
                                <span>Work</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-56 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/60 z-50 p-2'>
                            <ul className="space-y-1">
                                {workMenuItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <li key={item.path}>
                                            <Link 
                                                to={item.path} 
                                                className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600'
                                            >
                                                <IconComponent size={18} />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </PopoverContent>
                    </Popover>

                    {/* Workforce Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-300 font-medium text-sm px-3 py-2"
                            >
                                <Users size={18} />
                                <span>Workforce</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-56 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/60 z-50 p-2'>
                            <ul className="space-y-1">
                                {workforceMenuItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <li key={item.path}>
                                            <Link 
                                                to={item.path} 
                                                className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600'
                                            >
                                                <IconComponent size={18} />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </PopoverContent>
                    </Popover>

                    
                </div>
            }
            centerContent={
                <div className="relative w-full max-w-2xl flex items-center" ref={searchRef}>
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 pr-4 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all duration-300 placeholder-gray-500 text-gray-700 shadow-sm hover:shadow-md text-sm"
                            placeholder="Search jobs, technicians..."
                            value={query}
                            onChange={handleSearchChange}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute mt-2 w-full bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl max-h-64 overflow-auto z-50">
                                <ul className="py-2">
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={suggestion.id || suggestion.name || index}
                                            className="px-4 py-2.5 cursor-pointer hover:bg-gray-50/80 transition-all duration-200 border-b border-gray-100/60 last:border-b-0"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700 font-medium text-sm">{suggestion.name}</span>
                                                {suggestion.type !== "none" && (
                                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                                                        {suggestion.type}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            }
        />
    );
};

export default IndividualRecruiterNavbar;
