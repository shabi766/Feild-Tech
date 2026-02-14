import { Search, MapPin, Briefcase, Users, Building2, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/Hooks/useTranslation';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            searchJobHandler();
        }
    };

    const popularSearches = [
        "HVAC Technician",
        "Electrician",
        "Plumber",
        "Solar Installer",
        "Network Engineer",
        "Maintenance Tech",
    ];

    const stats = [
        { icon: Briefcase, label: "Active Jobs", value: "10,000+", color: "text-blue-600" },
        { icon: Building2, label: "Companies", value: "500+", color: "text-emerald-600" },
        { icon: Users, label: "Technicians", value: "50,000+", color: "text-orange-600" },
    ];

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-100/30 to-transparent rounded-full blur-3xl"></div>
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle, #3B82F6 1px, transparent 1px)`,
                        backgroundSize: '32px 32px'
                    }}
                ></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {/* Badge */}
                <motion.div
                    className="flex justify-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200/50 shadow-sm">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700 tracking-wide">
                            #1 Field Service Job Portal
                        </span>
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                        Find Field Service Jobs{' '}
                        <br className="hidden sm:block" />
                        That Match Your{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            Skills
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Connect with top companies hiring HVAC technicians, electricians, plumbers,
                        and field service professionals. Your next career move starts here.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    className="max-w-2xl mx-auto mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className={`flex items-center bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${isFocused
                        ? 'border-blue-400 shadow-blue-100/50 shadow-xl'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center flex-1 px-5 py-4">
                            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search jobs, skills, or companies..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={handleKeyDown}
                                className="w-full text-base text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                                aria-label="Search for jobs"
                            />
                        </div>
                        <div className="pr-2">
                            <Button
                                onClick={searchJobHandler}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Popular Searches */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-2 mb-14"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                >
                    <span className="text-sm text-gray-500 font-medium mr-1">Popular:</span>
                    {popularSearches.map((term, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                dispatch(setSearchedQuery(term));
                                navigate("/browse");
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600 bg-white/80 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200"
                        >
                            {term}
                        </button>
                    ))}
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                            whileHover={{ y: -2 }}
                        >
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${index === 0
                                    ? 'from-blue-50 to-blue-100'
                                    : index === 1
                                        ? 'from-emerald-50 to-emerald-100'
                                        : 'from-orange-50 to-orange-100'
                                }`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    className="flex items-center justify-center gap-6 mt-12 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <div className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Verified Companies</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>Smart Matching</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span>Instant Apply</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;
