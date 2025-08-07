import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavbarBase from './NavbarBase';

const GeneralNavbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/find-tech', label: 'Find Tech' },
        { path: '/find-work', label: 'Find Work' },
        { path: '/service-coverage', label: 'Service Coverage' },
        { path: '/resources', label: 'Resources' },
        { path: '/about', label: 'About' }
    ];

    return (
        <NavbarBase>
            <ul className='flex items-center gap-1'>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <li key={item.path}>
                            <Link 
                                to={item.path}
                                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group ${
                                    isActive 
                                        ? 'text-blue-600 bg-blue-50/80' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/50'
                                }`}
                            >
                                <span className="relative z-10">{item.label}</span>
                                {isActive && (
                                    <div className="absolute inset-0 bg-blue-50/80 rounded-lg transition-all duration-300" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 rounded-lg transition-all duration-300" />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </NavbarBase>
    );
};

export default GeneralNavbar;