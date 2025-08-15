import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { 
    Trophy, 
    Medal, 
    Star, 
    TrendingUp, 
    Users, 
    Award, 
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    Crown,
    Target,
    Clock,
    CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { LEADERBOARD_API_END_POINT } from '@/components/utils/constant';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [topPerformers, setTopPerformers] = useState([]);
    const [trendingTechnicians, setTrendingTechnicians] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('overallScore');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        { id: 'all', name: 'All Categories', icon: Trophy },
        { id: 'quality', name: 'Quality', icon: Star },
        { id: 'punctuality', name: 'Punctuality', icon: Clock },
        { id: 'communication', name: 'Communication', icon: Users },
        { id: 'professionalism', name: 'Professionalism', icon: Award },
        { id: 'problem_solving', name: 'Problem Solving', icon: Target },
        { id: 'teamwork', name: 'Teamwork', icon: Users }
    ];

    const sortOptions = [
        { value: 'overallScore', label: 'Overall Score' },
        { value: 'averageRating', label: 'Average Rating' },
        { value: 'totalJobsCompleted', label: 'Jobs Completed' },
        { value: 'onTimeArrivalRate', label: 'On-Time Rate' },
        { value: 'jobCompletionRate', label: 'Completion Rate' }
    ];

    useEffect(() => {
        loadLeaderboardData();
    }, [currentPage, selectedCategory, sortBy]);

    const loadLeaderboardData = async () => {
        try {
            setLoading(true);
            
            // Load global leaderboard
            const leaderboardResponse = await axios.get(
                `${LEADERBOARD_API_END_POINT}/global?page=${currentPage}&limit=20&category=${selectedCategory}&sortBy=${sortBy}`
            );
            
            if (leaderboardResponse.data.success) {
                setLeaderboard(leaderboardResponse.data.leaderboard || []);
                setTotalPages(leaderboardResponse.data.pagination?.totalPages || 1);
            }

            // Load top performers
            const topPerformersResponse = await axios.get(`${LEADERBOARD_API_END_POINT}/top-performers`);
            if (topPerformersResponse.data.success) {
                setTopPerformers(topPerformersResponse.data.topPerformers || []);
            }

            // Load trending technicians
            const trendingResponse = await axios.get(`${LEADERBOARD_API_END_POINT}/trending`);
            if (trendingResponse.data.success) {
                setTrendingTechnicians(trendingResponse.data.trending || []);
            }

            // Load leaderboard stats
            const statsResponse = await axios.get(`${LEADERBOARD_API_END_POINT}/stats`);
            if (statsResponse.data.success) {
                setStats(statsResponse.data.stats || {});
            }

        } catch (error) {
            console.error('Error loading leaderboard data:', error);
            toast.error('Failed to load leaderboard data');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
        if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
        if (rank <= 10) return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
        if (rank <= 50) return 'bg-gradient-to-r from-green-500 to-green-700 text-white';
        return 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
    };

    const renderStars = (rating, size = 'w-4 h-4') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className={`${size} fill-yellow-400 text-yellow-400`} />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className={`${size} text-gray-300`} />);
        }

        return stars;
    };

    const filteredLeaderboard = leaderboard.filter(technician =>
        technician.technician?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technician.technician?.profile?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Technician Leaderboard
                </h1>
                <p className="text-gray-600 mt-2">Discover the top-performing technicians in our community</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <Users className="w-8 h-8" />
                                <div>
                                    <p className="text-sm opacity-90">Total Technicians</p>
                                    <p className="text-2xl font-bold">{stats.totalTechnicians || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-8 h-8" />
                                <div>
                                    <p className="text-sm opacity-90">Jobs Completed</p>
                                    <p className="text-2xl font-bold">{stats.totalJobsCompleted || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <Star className="w-8 h-8" />
                                <div>
                                    <p className="text-sm opacity-90">Avg Rating</p>
                                    <p className="text-2xl font-bold">{(stats.averageRating || 0).toFixed(1)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="w-8 h-8" />
                                <div>
                                    <p className="text-sm opacity-90">Top Score</p>
                                    <p className="text-2xl font-bold">{stats.topScore || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Top 3 Performers */}
            {topPerformers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                <span>Top 3 Performers</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {topPerformers.slice(0, 3).map((technician, index) => (
                                    <div key={technician._id} className="text-center">
                                        <div className="relative mb-4">
                                            <Avatar className={`w-20 h-20 mx-auto ${index === 0 ? 'ring-4 ring-yellow-400' : index === 1 ? 'ring-4 ring-gray-300' : 'ring-4 ring-amber-500'}`}>
                                                <AvatarImage src={technician.technician?.profile?.avatar} />
                                                <AvatarFallback className="text-2xl">
                                                    {technician.technician?.fullname?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -top-2 -right-2">
                                                {getRankIcon(index + 1)}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg">{technician.technician?.fullname}</h3>
                                        <p className="text-gray-600 text-sm">{technician.technician?.profile?.title}</p>
                                        <div className="flex items-center justify-center space-x-1 mt-2">
                                            {renderStars(technician.averageRating || 0)}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Score: {technician.overallScore?.toFixed(0) || 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        {/* Category Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="flex items-center space-x-2 flex-1">
                            <Search className="w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search technicians..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Award className="w-6 h-6 text-blue-600" />
                        <span>Global Rankings</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredLeaderboard.map((technician, index) => (
                            <motion.div
                                key={technician._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                            >
                                {/* Rank */}
                                <div className="flex-shrink-0">
                                    <Badge className={`${getRankBadge(technician.rank)} px-3 py-1 text-sm font-bold`}>
                                        #{technician.rank || index + 1}
                                    </Badge>
                                </div>

                                {/* Avatar and Name */}
                                <div className="flex items-center space-x-3 flex-1">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={technician.technician?.profile?.avatar} />
                                        <AvatarFallback>
                                            {technician.technician?.fullname?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {technician.technician?.fullname}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {technician.technician?.profile?.title || 'Technician'}
                                        </p>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                        {renderStars(technician.averageRating || 0)}
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        {(technician.averageRating || 0).toFixed(1)}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="text-center">
                                        <p className="font-semibold">{technician.totalJobsCompleted || 0}</p>
                                        <p className="text-xs">Jobs</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">{(technician.onTimeArrivalRate || 0).toFixed(0)}%</p>
                                        <p className="text-xs">On-Time</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">{(technician.jobCompletionRate || 0).toFixed(0)}%</p>
                                        <p className="text-xs">Complete</p>
                                    </div>
                                </div>

                                {/* Overall Score */}
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {technician.overallScore?.toFixed(0) || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Score</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Trending Technicians */}
            {trendingTechnicians.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                                <span>Trending Technicians</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {trendingTechnicians.map((technician, index) => (
                                    <div key={technician._id} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={technician.technician?.profile?.avatar} />
                                                <AvatarFallback>
                                                    {technician.technician?.fullname?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{technician.technician?.fullname}</h4>
                                                <p className="text-sm text-gray-600">{technician.technician?.profile?.title}</p>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    {renderStars(technician.averageRating || 0, 'w-3 h-3')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600">
                                                    +{technician.scoreIncrease || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Score Gain</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default Leaderboard;
