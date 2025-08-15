import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Star, Trophy, Clock, CheckCircle, AlertTriangle, TrendingUp, MessageCircle, MapPin, Phone, Mail, Award, User, Calendar, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { REVIEW_API_END_POINT, LEADERBOARD_API_END_POINT, TECHNICIAN_API_END_POINT } from '@/components/utils/constant';
import { toast } from 'sonner';
import ReviewModal from './ReviewModal';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TechnicianProfile = ({ job, canReview = false, onReviewSubmitted }) => {
    const { id } = useParams(); // Get technician ID from URL
    const { user } = useSelector(store => store.auth);
    const [technician, setTechnician] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({});
    const [leaderboardStats, setLeaderboardStats] = useState({});
    const [loading, setLoading] = useState(true); // Start with true since we need to fetch technician data
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [apiDataLoaded, setApiDataLoaded] = useState(false);

    // First, fetch the basic technician data
    useEffect(() => {
        const technicianId = id || user?._id;
        if (technicianId) {
            fetchTechnicianBasicInfo(technicianId);
        } else if (user?._id) {
            // If no ID in URL but user is logged in, use their own ID
            fetchTechnicianBasicInfo(user._id);
        }
    }, [id, user?._id]);

    // Then, try to load additional data if technician data is available
    useEffect(() => {
        if (technician?._id) {
            console.log('TechnicianProfile: Basic technician data available:', technician);
            // Try to load additional data in the background
            loadAdditionalData();
        }
    }, [technician?._id, currentPage]);

    const fetchTechnicianBasicInfo = async (technicianId) => {
        try {
            console.log('TechnicianProfile: Fetching technician basic info for ID:', technicianId);
            const response = await axios.get(`${TECHNICIAN_API_END_POINT}/${technicianId}`, { withCredentials: true });
            
            if (response.data.success) {
                setTechnician(response.data.technician);
                console.log('TechnicianProfile: Technician data loaded:', response.data.technician);
            } else {
                console.error('Failed to load technician data:', response.data.message);
                toast.error('Failed to load technician profile');
            }
        } catch (error) {
            console.error('Error fetching technician data:', error);
            toast.error('Error loading technician profile');
        } finally {
            setLoading(false);
        }
    };

    const loadAdditionalData = async () => {
        try {
            setLoading(true);
            console.log('TechnicianProfile: Loading additional data...');
            
            // Always try to fetch reviews first
            try {
                const reviewsResponse = await axios.get(
                    `${REVIEW_API_END_POINT}/technician/${technician._id}?page=${currentPage}&limit=10`
                );
                if (reviewsResponse.data.success) {
                    setReviews(reviewsResponse.data.reviews || []);
                    setTotalPages(reviewsResponse.data.pagination?.totalPages || 1);
                    console.log('TechnicianProfile: Reviews loaded successfully:', reviewsResponse.data.reviews?.length || 0);
                }
            } catch (error) {
                console.warn('Reviews not available yet:', error.message);
                setReviews([]);
            }
            
            // Try to fetch review stats
            try {
                const statsResponse = await axios.get(
                    `${REVIEW_API_END_POINT}/technician/${technician._id}/stats`
                );
                if (statsResponse.data.success) {
                    setReviewStats(statsResponse.data.stats || {});
                    console.log('TechnicianProfile: Review stats loaded successfully');
                }
            } catch (error) {
                console.warn('Review stats not available yet:', error.message);
            }
            
            // Try to fetch leaderboard stats
            try {
                const leaderboardResponse = await axios.get(
                    `${LEADERBOARD_API_END_POINT}/technician/${technician._id}`
                );
                if (leaderboardResponse.data.success) {
                    setLeaderboardStats(leaderboardResponse.data);
                    console.log('TechnicianProfile: Leaderboard stats loaded successfully');
                }
            } catch (error) {
                console.warn('Leaderboard stats not available yet:', error.message);
            }
            
            setApiDataLoaded(true);
        } catch (error) {
            console.error('Error loading additional data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating, size = 'w-4 h-4') => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`${size} ${
                    i < Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : i < rating
                        ? 'text-yellow-400 fill-current opacity-50'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 4.0) return 'text-blue-600';
        if (rating >= 3.5) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const getPerformanceColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 75) return 'text-blue-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Show loading while fetching basic technician data
    if (loading && !technician) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading technician profile...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                </div>
            </div>
        );
    }

    // Fallback display if no technician data
    if (!technician) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 text-lg">No technician data available</p>
                    <p className="text-gray-600">Please try refreshing the page</p>
                    <p className="text-sm text-gray-500 mt-2">Technician ID: {id}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={technician?.profile?.photo} />
                            <AvatarFallback className="text-2xl">
                                {technician?.fullname?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{technician?.fullname}</h1>
                                    <p className="text-gray-600 text-lg">Technician</p>
                                    
                                    {/* Rank Display - Top Priority */}
                                    <div className="flex items-center space-x-3 mt-2 mb-2">
                                        {leaderboardStats?.rank && (
                                            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
                                                <Trophy className="w-5 h-5" />
                                                <span className="font-bold text-lg">#{leaderboardStats.rank}</span>
                                                <span className="text-sm">Rank</span>
                                            </div>
                                        )}
                                        {leaderboardStats?.overallScore && (
                                            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-full shadow-lg">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="font-bold">{leaderboardStats.overallScore.toFixed(0)}</span>
                                                <span className="text-xs">Score</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Basic Contact Info */}
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                        {technician?.email && (
                                            <div className="flex items-center space-x-1">
                                                <Mail className="w-4 h-4" />
                                                <span>{technician.email}</span>
                                            </div>
                                        )}
                                        {technician?.phoneNumber && (
                                            <div className="flex items-center space-x-1">
                                                <Phone className="w-4 h-4" />
                                                <span>{technician.phoneNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Rating Display - Show if available */}
                                    {(reviewStats.averageRating || technician.performance?.averageRating) ? (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <div className="flex items-center">
                                                {renderStars(reviewStats.averageRating || technician.performance?.averageRating || 0, 'w-5 h-5')}
                                            </div>
                                            <span className={`text-lg font-semibold ${getRatingColor(reviewStats.averageRating || technician.performance?.averageRating || 0)}`}>
                                                {(reviewStats.averageRating || technician.performance?.averageRating || 0).toFixed(1)}
                                            </span>
                                            <span className="text-gray-600">
                                                ({reviewStats.totalReviews || technician.performance?.totalReviews || 0} reviews)
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-2">
                                            No reviews yet - be the first to review this technician!
                                        </p>
                                    )}
                                    
                                    {/* Reviews Summary - Show if reviews exist */}
                                    {reviews.length > 0 && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Latest Review: {reviews[0]?.comment?.substring(0, 60)}...
                                                    </span>
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    {reviews.length} total reviews
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 md:mt-0">
                                    {canReview && (
                                        <Button
                                            onClick={() => setShowReviewModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Star className="w-4 h-4 mr-2" />
                                            Review Technician
                                        </Button>
                                    )}
                                    <Button variant="outline">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Send Message
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Basic Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Profile Status</p>
                                <p className="text-lg font-bold text-green-600">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Member Since</p>
                                <p className="text-lg font-bold">
                                    {technician?.createdAt ? new Date(technician.createdAt).getFullYear() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="text-lg font-bold">
                                    {technician?.profile?.location || 'Not specified'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Skills Section */}
            {technician?.profile?.skills && technician.profile.skills.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Award className="w-6 h-6 text-blue-600" />
                            <span>Skills & Expertise</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {technician.profile.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-sm">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bio Section */}
            {technician?.profile?.bio && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                            <span>About</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">{technician.profile.bio}</p>
                    </CardContent>
                </Card>
            )}

            {/* Performance Stats - Always show if available */}
            {(leaderboardStats.stats || technician.performance) && (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Jobs Completed</p>
                                        <p className="text-2xl font-bold">
                                            {leaderboardStats.stats?.totalJobsCompleted || technician.performance?.totalJobsCompleted || 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">On-time Rate</p>
                                        <p className={`text-2xl font-bold ${getPerformanceColor(leaderboardStats.stats?.onTimeArrivalRate || technician.performance?.onTimeArrivalRate || 0)}`}>
                                            {leaderboardStats.stats?.onTimeArrivalRate || technician.performance?.onTimeArrivalRate || 0}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Leaderboard Rank</p>
                                        <p className="text-2xl font-bold">
                                            #{leaderboardStats.ranking?.rank || technician.performance?.leaderboardRank || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Overall Score</p>
                                        <p className="text-2xl font-bold">
                                            {leaderboardStats.stats?.overallScore || technician.performance?.overallScore || 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Reviews Section - Always show if available */}
            {reviews.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Star className="w-6 h-6 text-yellow-500" />
                            <span>Customer Reviews ({reviews.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <div className="flex items-start space-x-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={review.reviewerId?.profile?.photo} />
                                            <AvatarFallback>
                                                {review.reviewerId?.fullname?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="font-semibold">{review.reviewerId?.fullname}</span>
                                                <div className="flex items-center">
                                                    {renderStars(review.rating, 'w-4 h-4')}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-700 mb-2">{review.comment}</p>
                                            
                                            {/* Show review categories if available */}
                                            {review.categories && review.categories.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {review.categories.map((category, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {category}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination for reviews */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Review Statistics - Show if available */}
            {reviewStats.ratingBreakdown && Object.keys(reviewStats.ratingBreakdown).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                            <span>Review Breakdown</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {reviewStats.ratingBreakdown[`${rating === 5 ? 'five' : rating === 4 ? 'four' : rating === 3 ? 'three' : rating === 2 ? 'two' : 'one'}Star`] || 0}
                                    </div>
                                    <div className="flex items-center justify-center space-x-1 mt-1">
                                        {renderStars(rating, 'w-3 h-3')}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{rating} Star</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Reviews Message */}
            {!loading && reviews.length === 0 && (
                <Card>
                    <CardContent className="p-6 text-center">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                        <p className="text-gray-500">
                            This technician hasn't received any reviews yet. Reviews will appear here after completing jobs and receiving feedback from recruiters.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Loading indicator for additional data */}
            {loading && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600">Loading additional performance data...</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <ReviewModal
                    open={showReviewModal}
                    setOpen={setShowReviewModal}
                    job={job}
                    technician={technician}
                    onReviewSubmitted={(review) => {
                        onReviewSubmitted?.(review);
                        loadAdditionalData(); // Refresh data after review
                    }}
                />
            )}
        </div>
    );
};

export default TechnicianProfile;
