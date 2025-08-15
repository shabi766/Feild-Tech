import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Star, CheckCircle, Clock, MessageCircle, Shield, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { REVIEW_API_END_POINT } from '@/components/utils/constant';

const ReviewModal = ({ open, setOpen, job, technician, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [categories, setCategories] = useState([]);
    const [metrics, setMetrics] = useState({
        onTimeArrival: true,
        jobCompletedOnTime: true,
        qualityOfWork: 5,
        communication: 5,
        professionalism: 5
    });
    const [loading, setLoading] = useState(false);

    const categoryOptions = [
        { id: 'punctuality', label: 'Punctuality', icon: Clock },
        { id: 'quality', label: 'Quality of Work', icon: CheckCircle },
        { id: 'communication', label: 'Communication', icon: MessageCircle },
        { id: 'professionalism', label: 'Professionalism', icon: Shield },
        { id: 'problem_solving', label: 'Problem Solving', icon: Zap },
        { id: 'teamwork', label: 'Teamwork', icon: Users }
    ];

    const handleCategoryToggle = (categoryId) => {
        setCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            toast.error('Please write a review comment (minimum 10 characters)');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${REVIEW_API_END_POINT}/create`, {
                jobId: job._id,
                technicianId: technician._id,
                rating,
                comment: comment.trim(),
                categories,
                metrics
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success('Review submitted successfully!');
                setOpen(false);
                onReviewSubmitted?.(response.data.review);
                resetForm();
            } else {
                toast.error(response.data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'An error occurred while submitting the review');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setRating(0);
        setComment('');
        setCategories([]);
        setMetrics({
            onTimeArrival: true,
            jobCompletedOnTime: true,
            qualityOfWork: 5,
            communication: 5,
            professionalism: 5
        });
    };

    const handleClose = () => {
        if (!loading) {
            setOpen(false);
            resetForm();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Review Technician
                    </DialogTitle>
                    <p className="text-center text-gray-600">
                        Share your experience working with {technician?.fullname}
                    </p>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Job Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Job Details</h3>
                        <p className="text-gray-600">{job?.title}</p>
                        <p className="text-sm text-gray-500">Completed on {new Date(job?.paidTime || job?.doneTime).toLocaleDateString()}</p>
                    </div>

                    {/* Overall Rating */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Overall Rating *</Label>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= (hoveredRating || rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </p>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Categories (Optional)</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {categoryOptions.map((category) => {
                                const Icon = category.icon;
                                const isSelected = categories.includes(category.id);
                                
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleCategoryToggle(category.id)}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{category.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Performance Metrics</Label>
                        
                        {/* Binary Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">On-time Arrival</Label>
                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        variant={metrics.onTimeArrival ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setMetrics(prev => ({ ...prev, onTimeArrival: true }))}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={!metrics.onTimeArrival ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setMetrics(prev => ({ ...prev, onTimeArrival: false }))}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm">Job Completed On Time</Label>
                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        variant={metrics.jobCompletedOnTime ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setMetrics(prev => ({ ...prev, jobCompletedOnTime: true }))}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={!metrics.jobCompletedOnTime ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setMetrics(prev => ({ ...prev, jobCompletedOnTime: false }))}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Rating Metrics */}
                        {['qualityOfWork', 'communication', 'professionalism'].map((metric) => (
                            <div key={metric} className="space-y-2">
                                <Label className="text-sm capitalize">
                                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                                </Label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setMetrics(prev => ({ ...prev, [metric]: star }))}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`w-5 h-5 ${
                                                    star <= metrics[metric]
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Review Comment */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">
                            Review Comment * <span className="text-sm text-gray-500">(Minimum 10 characters)</span>
                        </Label>
                        <Textarea
                            placeholder="Share your experience working with this technician. What went well? What could be improved?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[120px] resize-none"
                            maxLength={1000}
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{comment.length}/1000 characters</span>
                            <span className={comment.length < 10 ? 'text-red-500' : 'text-green-500'}>
                                {comment.length < 10 ? 'Too short' : 'Good length'}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || rating === 0 || comment.trim().length < 10}
                            className="min-w-[120px]"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewModal;
