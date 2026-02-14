import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavbarBase from './NavbarBase';
import { Search, Wrench, MapPin, BookOpen, Info } from 'lucide-react';

const GeneralNavbar = ({ setLogoutFlag }) => {
    const location = useLocation();

    const navItems = [
        { path: '/find-tech', label: 'Find Tech', icon: Search },
        { path: '/find-work', label: 'Find Work', icon: Wrench },
        { path: '/service-coverage', label: 'Service Coverage', icon: MapPin },
        { path: '/resources', label: 'Resources', icon: BookOpen },
        { path: '/about', label: 'About', icon: Info }
    ];

    return (
        <NavbarBase setLogoutFlag={setLogoutFlag}>
            <ul className='flex items-center gap-1'>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const IconComponent = item.icon;
                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-300 group text-sm ${isActive
                                        ? 'text-blue-600 bg-blue-50/80'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/60'
                                    }`}
                            >
                                <IconComponent
                                    size={15}
                                    className={`transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                                        }`}
                                />
                                <span className="relative z-10">{item.label}</span>
                                {isActive && (
                                    <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </NavbarBase>
    );
};

export default GeneralNavbar;