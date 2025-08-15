import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { 
    Trophy, 
    Medal, 
    Star, 
    TrendingUp, 
    Target,
    Clock,
    CheckCircle,
    Award,
    Crown,
    BarChart3
} from 'lucide-react';
import axios from 'axios';
import { LEADERBOARD_API_END_POINT } from '@/components/utils/constant';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const TechnicianLeaderboard = () => {
    const [myRanking, setMyRanking] = useState(null);
    const [topPerformers, setTopPerformers] = useState([]);
    const [myStats, setMyStats] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        if (user?._id) {
            loadLeaderboardData();
        }
    }, [user?._id]);

    const loadLeaderboardData = async () => {
        try {
            setLoading(true);
            
            // Load my ranking and stats
            const myRankingResponse = await axios.get(
                `${LEADERBOARD_API_END_POINT}/technician/${user._id}`,
                { withCredentials: true }
            );
            
            if (myRankingResponse.data.success) {
                setMyRanking(myRankingResponse.data);
                setMyStats(myRankingResponse.data.stats || myRankingResponse.data);
                console.log('My ranking data loaded:', myRankingResponse.data);
            }

            // Load top performers
            const topPerformersResponse = await axios.get(`${LEADERBOARD_API_END_POINT}/top-performers`);
            if (topPerformersResponse.data.success) {
                setTopPerformers(topPerformersResponse.data.topPerformers || []);
                console.log('Top performers loaded:', topPerformersResponse.data.topPerformers?.length || 0);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your performance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    My Performance Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Track your progress and see how you rank among technicians</p>
            </div>

            {/* My Current Ranking */}
            {myRanking ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Your Current Ranking</h2>
                                    <div className="flex items-center space-x-4">
                                        {myRanking.ranking?.rank && (
                                            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                                                <Trophy className="w-5 h-5" />
                                                <span className="font-bold text-lg">#{myRanking.ranking.rank}</span>
                                                <span className="text-sm">Rank</span>
                                            </div>
                                        )}
                                        {myRanking.stats?.overallScore && (
                                            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="font-bold">{myRanking.stats.overallScore.toFixed(0)}</span>
                                                <span className="text-xs">Score</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-6xl font-bold opacity-80">
                                        {myRanking.ranking?.rank || 'N/A'}
                                    </div>
                                    <p className="text-sm opacity-80">Current Position</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                        <CardContent className="p-6 text-center">
                            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h2 className="text-2xl font-bold mb-2">No Ranking Data Yet</h2>
                            <p className="opacity-80">
                                Complete some jobs and receive reviews to see your ranking and performance metrics.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* My Performance Stats */}
            {myStats ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                                <span>My Performance Metrics</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {myStats.totalJobsCompleted || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">Jobs Completed</p>
                                </div>
                                
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">
                                        {(myStats.onTimeArrivalRate || 0).toFixed(0)}%
                                    </p>
                                    <p className="text-sm text-gray-600">On-Time Rate</p>
                                </div>
                                
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {(myStats.jobCompletionRate || 0).toFixed(0)}%
                                    </p>
                                    <p className="text-sm text-gray-600">Completion Rate</p>
                                </div>
                                
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Star className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {(myStats.averageRating || 0).toFixed(1)}
                                    </p>
                                    <p className="text-sm text-gray-600">Avg Rating</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardContent className="p-6 text-center">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Performance Data Yet</h3>
                            <p className="text-gray-500">
                                Performance metrics will appear here after you complete jobs and receive reviews.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Top Performers */}
            {topPerformers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                <span>Top Performers</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topPerformers.slice(0, 10).map((technician, index) => (
                                    <motion.div
                                        key={technician._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${
                                            technician.technician?._id === user?._id 
                                                ? 'border-blue-300 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <Badge className={`${getRankBadge(index + 1)} px-3 py-1 text-sm font-bold`}>
                                                    #{index + 1}
                                                </Badge>
                                                {technician.technician?._id === user?._id && (
                                                    <Badge className="bg-blue-100 text-blue-800 px-2 py-1 text-xs">
                                                        You
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={technician.technician?.profile?.avatar} />
                                                <AvatarFallback>
                                                    {technician.technician?.fullname?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {technician.technician?.fullname}
                                                </h3>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    {renderStars(technician.averageRating || 0, 'w-3 h-3')}
                                                    <span className="text-sm text-gray-600 ml-1">
                                                        ({technician.totalReviews || 0} reviews)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">
                                                {technician.overallScore?.toFixed(0) || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">Score</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Motivation Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardContent className="p-6 text-center">
                        <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Keep Up the Great Work!</h3>
                        <p className="text-gray-600 mb-4">
                            Your performance is tracked based on job completion, punctuality, and customer satisfaction. 
                            Continue delivering excellent service to climb the rankings!
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Complete jobs on time</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>Arrive punctually</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span>Maintain high ratings</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default TechnicianLeaderboard;
