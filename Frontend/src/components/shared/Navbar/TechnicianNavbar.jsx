import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarBase from './NavbarBase';
import { SEARCH_API_END_POINT } from '@/components/utils/constant';
import axios from 'axios';
import { Search } from 'lucide-react';

const TechnicianNavbar = ({ user }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

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
    },);

    return (

        <NavbarBase user={user}>
            <div className="flex items-center w-full">
                <div className="flex items-center">
                    <div className="border-l-2 border-gray-300 h-10 mx-2 ml-3" />
            <div className='flex items-center gap-4 mx-4 text-white text-bold'>
                
                
                <li><Link to="/browse">Latest Jobs</Link></li>
                <li><Link to="/Myjobs">MyJobs</Link></li>
                
                {/* Add more Technician-specific links here */}
            </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-grow mx-20 flex items-center w-full" ref={searchRef}>
                <input
                    type="text"
                    className="px-20 py-2 border border-gray-300 rounded-full focus:outline-none w-full"
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
        </NavbarBase>
    );
};

export default TechnicianNavbar;