import React, { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Plus, Search, Users, Briefcase, UserPlus, FileText, Calendar, Settings, Wallet, MessageCircle, ChevronDown } from 'lucide-react';
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
                break;
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
        { path: '/app/recruiter/jobs/create-simple', label: 'Post Job', icon: Briefcase, desc: 'Create a new job listing' },
        { path: '/app/recruiter/technicians/techs', label: 'Browse Technicians', icon: Users, desc: 'Find skilled workers' }
    ];

    const workMenuItems = [
        { path: '/app/recruiter/jobs', label: 'My Jobs', icon: Briefcase, desc: 'Manage your listings' },
        { path: '/app/recruiter/job-calendar', label: 'Job Calendar', icon: Calendar, desc: 'Schedule & timeline' },
        { path: '/app/recruiter/applicants', label: 'Applicants', icon: UserPlus, desc: 'Review applications' }
    ];

    const workforceMenuItems = [
        { path: '/app/recruiter/technicians/techs', label: 'All Technicians', icon: Users, desc: 'Browse technicians' },
        { path: '/app/recruiter/talentpool', label: 'Talent Pool', icon: Users, desc: 'Saved candidates' }
    ];

    const renderDropdownMenu = (items, title, TitleIcon) => (
        <div className="p-1.5">
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <TitleIcon size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
            </div>
            <ul className="space-y-0.5">
                {items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600 group'
                            >
                                <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                                    <IconComponent size={16} className="group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                    {item.desc && <p className="text-xs text-gray-400">{item.desc}</p>}
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <NavbarBase
            user={user}
            setLogoutFlag={setLogoutFlag}
            leftContent={
                <div className="flex items-center gap-1">
                    {/* Create Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-300 font-medium text-sm px-3 py-2"
                            >
                                <Plus size={16} />
                                <span>Create</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-64 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/60 z-50 overflow-hidden'>
                            {renderDropdownMenu(createMenuItems, 'Create New', Plus)}
                        </PopoverContent>
                    </Popover>

                    {/* Work Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-300 font-medium text-sm px-3 py-2"
                            >
                                <Briefcase size={16} />
                                <span>Work</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-64 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/60 z-50 overflow-hidden'>
                            {renderDropdownMenu(workMenuItems, 'Work Management', Briefcase)}
                        </PopoverContent>
                    </Popover>

                    {/* Workforce Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-300 font-medium text-sm px-3 py-2"
                            >
                                <Users size={16} />
                                <span>Workforce</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-64 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/60 z-50 overflow-hidden'>
                            {renderDropdownMenu(workforceMenuItems, 'Workforce', Users)}
                        </PopoverContent>
                    </Popover>
                </div>
            }
            centerContent={
                <div className="relative w-full max-w-2xl flex items-center" ref={searchRef}>
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 pr-4 bg-gray-50/80 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white transition-all duration-300 placeholder-gray-400 text-gray-700 text-sm"
                            placeholder="Search jobs, technicians..."
                            value={query}
                            onChange={handleSearchChange}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute mt-2 w-full bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-2xl max-h-64 overflow-auto z-50">
                                <ul className="py-1.5">
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={suggestion.id || suggestion.name || index}
                                            className="px-4 py-2.5 cursor-pointer hover:bg-blue-50/80 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700 font-medium text-sm">{suggestion.name}</span>
                                                {suggestion.type !== "none" && (
                                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
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
