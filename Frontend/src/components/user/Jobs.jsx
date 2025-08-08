import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Workorder from '../user/Workorder.jsx';
import { useSelector } from 'react-redux';
import FilterCard from '../user/Filtercard.jsx';
import { Search, Filter, MapPin, Briefcase, DollarSign, Calendar, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const Jobs = () => {
    // Accessing jobs and search query from Redux store
    const { allJobs = [], searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    // Advanced filters
    const [filters, setFilters] = useState({
        jobType: 'all',
        workType: 'all',
        location: '',
        experience: 'all',
        salary: 'all'
    });

    useEffect(() => {
        // Ensure searchedQuery is a string or an empty string
        const query = searchedQuery ? searchedQuery.toString().toLowerCase() : '';

        let filteredJobs = allJobs;

        // Apply search filter
        if (query) {
            filteredJobs = filteredJobs.filter((job) => {
                const { street, city, state, postalCode, country } = job?.location || {};
                const fullAddress = `${street || ''} ${city || ''} ${state || ''} ${postalCode || ''} ${country || ''}`.toLowerCase();

                return job.title.toLowerCase().includes(query) ||
                    job.description.toLowerCase().includes(query) ||
                    fullAddress.includes(query);
            });
        }

        // Apply advanced filters
        filteredJobs = filteredJobs.filter((job) => {
            return (
                (filters.jobType === 'all' || job.jobType === filters.jobType) &&
                (filters.workType === 'all' || job.workType === filters.workType) &&
                (filters.location === '' || 
                    job.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
                    job.location?.state?.toLowerCase().includes(filters.location.toLowerCase())) &&
                (filters.experience === 'all' || 
                    (filters.experience === 'entry' && job.experience <= 2) ||
                    (filters.experience === 'mid' && job.experience > 2 && job.experience <= 5) ||
                    (filters.experience === 'senior' && job.experience > 5)) &&
                (filters.salary === 'all' || 
                    (filters.salary === 'low' && (job.salary?.payableSalary || 0) < 50000) ||
                    (filters.salary === 'mid' && (job.salary?.payableSalary || 0) >= 50000 && (job.salary?.payableSalary || 0) < 100000) ||
                    (filters.salary === 'high' && (job.salary?.payableSalary || 0) >= 100000))
            );
        });

        setFilterJobs(filteredJobs);
    }, [allJobs, searchedQuery, filters]);

    // Creative morphing background shapes
    const MorphingBackground = () => {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Morphing blob shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-morph-slow"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-morph-delayed"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-morph"></div>

                {/* Floating geometric shapes */}
                <div className="absolute top-20 right-20 w-16 h-16 border-2 border-blue-300/20 rotate-45 animate-spin-slow"></div>
                <div className="absolute bottom-32 left-32 w-12 h-12 bg-green-300/10 rounded-full animate-pulse-slow"></div>
                <div className="absolute top-1/3 right-1/3 w-8 h-8 border border-purple-300/30 transform rotate-12 animate-bounce-slow"></div>
                <div className="absolute bottom-20 right-1/4 w-10 h-10 bg-orange-300/15 rounded-full animate-float"></div>
            </div>
        );
    };

    // Floating particles system
    const FloatingParticles = () => {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${6 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>
        );
    };

    const clearAllFilters = () => {
        setFilters({
            jobType: 'all',
            workType: 'all',
            location: '',
            experience: 'all',
            salary: 'all'
        });
    };

    const activeFiltersCount = Object.values(filters).filter(value => value !== 'all' && value !== '').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
            {/* Creative Background Effects */}
            <MorphingBackground />
            <FloatingParticles />

            {/* Custom CSS for Animations */}
            <style>
                {`
                @keyframes morph {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                    33% { transform: translate(30px, -50px) rotate(120deg) scale(1.1); }
                    66% { transform: translate(-20px, 20px) rotate(240deg) scale(0.9); }
                }
                @keyframes morph-delayed {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                    33% { transform: translate(-30px, 50px) rotate(-120deg) scale(1.1); }
                    66% { transform: translate(20px, -20px) rotate(-240deg) scale(0.9); }
                }
                @keyframes morph-slow {
                    0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
                    50% { transform: translate(20px, -30px) rotate(180deg) scale(1.05); }
                }
                @keyframes particle {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes slideInUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    0% { opacity: 0; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
                    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
                }

                .animate-morph { animation: morph 8s ease-in-out infinite; }
                .animate-morph-delayed { animation: morph-delayed 10s ease-in-out infinite; }
                .animate-morph-slow { animation: morph-slow 12s ease-in-out infinite; }
                .animate-particle { animation: particle linear infinite; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-slideInUp { animation: slideInUp 0.8s ease-out forwards; }
                .animate-scaleIn { animation: scaleIn 0.6s ease-out forwards; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
                .animate-glow { animation: glow 2s ease-in-out infinite; }

                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
                .delay-600 { animation-delay: 0.6s; }
                .delay-700 { animation-delay: 0.7s; }
                .delay-800 { animation-delay: 0.8s; }

                .gradient-text {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                `}
            </style>

            <div className="relative z-10 py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <motion.div 
                        ref={ref}
                        className={`text-center mb-12 ${inView ? 'animate-slideInUp' : 'opacity-0'}`}
                    >
                        <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold text-sm mb-6">
                            <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
                            Find Your Perfect Job
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Browse
                            <span className="gradient-text"> Opportunities</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Discover amazing job opportunities that match your skills and career goals.
                        </p>
                    </motion.div>

                    {/* Advanced Filters */}
                    <motion.div 
                        className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 mb-8 ${inView ? 'animate-slideInUp delay-200' : 'opacity-0'}`}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                                <Filter className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Advanced Filters</h2>
                            {activeFiltersCount > 0 && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                                    {activeFiltersCount} active
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                            {/* Job Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                                <select
                                    value={filters.jobType}
                                    onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Types</option>
                                    <option value="full-time">Full-Time</option>
                                    <option value="part-time">Part-Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                            </div>

                            {/* Work Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                                <select
                                    value={filters.workType}
                                    onChange={(e) => setFilters({ ...filters, workType: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Work Types</option>
                                    <option value="remote">Remote</option>
                                    <option value="onsite">Onsite</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <Input
                                    type="text"
                                    placeholder="City or State"
                                    value={filters.location}
                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    className="w-full"
                                />
                            </div>

                            {/* Experience Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                                <select
                                    value={filters.experience}
                                    onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="entry">Entry Level (0-2 yrs)</option>
                                    <option value="mid">Mid Level (3-5 yrs)</option>
                                    <option value="senior">Senior Level (5+ yrs)</option>
                                </select>
                            </div>

                            {/* Salary Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                                <select
                                    value={filters.salary}
                                    onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Salaries</option>
                                    <option value="low">Under $50K</option>
                                    <option value="mid">$50K - $100K</option>
                                    <option value="high">Over $100K</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>{filterJobs.length} jobs found</span>
                                </div>
                            </div>
                            <Button
                                onClick={clearAllFilters}
                                variant="outline"
                                className="border-gray-300 hover:border-red-500 hover:text-red-600"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    </motion.div>

                    {/* Jobs Grid */}
                    <motion.div 
                        className={`${inView ? 'animate-slideInUp delay-400' : 'opacity-0'}`}
                    >
                        {filterJobs.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No jobs found</h3>
                                <p className="text-gray-600 mb-6">
                                    Try adjusting your search criteria or filters to find more opportunities.
                                </p>
                                <Button
                                    onClick={clearAllFilters}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filterJobs.map((job, index) => (
                                    <motion.div
                                        key={job?._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Workorder job={job} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
