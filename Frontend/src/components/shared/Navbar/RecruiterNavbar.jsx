import React, { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEARCH_API_END_POINT } from '@/components/utils/constant';
import axios from 'axios';
import NavbarBase from './NavbarBase';
import { Button } from '@/components/ui/button';

const RecruiterNavbar = ({ user }) => {
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
        <NavbarBase user={user}>
            <div className="flex items-center w-full">
                <div className="flex items-center">
                    <div className="border-l-2 border-gray-300 h-10 mx-2 ml-3" />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="link" className="text-teal-600 hover:text-teal-800">
                                <Plus size={24} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-48 bg-white shadow-lg rounded-lg border border-gray-300 z-10'>                            <ul>
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
                </div>

                <div className="relative flex-grow mx-20 flex items-center w-full" ref={searchRef}>
                    <input
                        type="text"
                     className="px-20 py-2 w-full border border-gray-300 rounded-full focus:outline-none"
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

export default RecruiterNavbar;