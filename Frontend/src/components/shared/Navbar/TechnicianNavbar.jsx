import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NavbarBase from './NavbarBase';
import { SEARCH_API_END_POINT } from '@/components/utils/constant';
import axios from 'axios';
import { Search, Briefcase, Clock } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

const TechnicianNavbar = ({ user, setLogoutFlag }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const { t } = useTranslation();

    const navItems = [
        { path: '/app/technician/browse', label: t('latestJobs'), icon: Briefcase },
        { path: '/app/technician/Myjobs', label: t('myJobs'), icon: Clock }
    ];

    const fetchSuggestions = async (searchTerm) => {
        if (searchTerm.length < 2) {
            setSuggestions();
            return;
        }

        try {
            const res = await axios.get(`${SEARCH_API_END_POINT}/search`, {
                withCredentials: true,
                params: { query: searchTerm }
            });
            setSuggestions(res.data.length ? res.data : [{ name: t('notFound'), type: "none" }]);
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
                navigate(`/app/technician/description/${suggestion.id}`);
                break;
            case 'client':
                navigate(`/app/technician/browse`);
                break;
            case 'project':
                navigate(`/app/technician/browse`);
                break;
            default:
                console.error('Unknown suggestion type:', suggestion.type);
        }
        setQuery('');
        setSuggestions();
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
        <NavbarBase 
            user={user}
            setLogoutFlag={setLogoutFlag}
            leftContent={
                <div className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const IconComponent = item.icon;
                        return (
                            <Link 
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 group ${
                                    isActive 
                                        ? 'text-blue-600 bg-blue-50/80' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/60'
                                }`}
                            >
                                <IconComponent size={16} className="transition-transform duration-300 group-hover:scale-110" />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            }
            centerContent={
                <div className="relative w-full max-w-2xl flex items-center" ref={searchRef}>
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="w-full px-4 py-2 pl-10 pr-4 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all duration-300 placeholder-gray-500 text-gray-700 shadow-sm hover:shadow-md text-sm"
                            placeholder="Search jobs, clients, projects..."
                            value={query}
                            onChange={handleSearchChange}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        {showSuggestions && suggestions && suggestions.length > 0 && (
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

export default TechnicianNavbar;