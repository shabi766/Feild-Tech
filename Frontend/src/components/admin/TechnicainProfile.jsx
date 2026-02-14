import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TECHNICIAN_API_END_POINT } from '../utils/constant';
import { useParams } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { MdEmail, MdPhone, MdLocationOn, MdStar, MdComment, MdCheckCircle } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { API_ENDPOINTS } from '@/config/environment';
import { Button } from '../ui/button';
import RatingStar from '../ui/RatingStar';
import ReviewCard from '../ui/ReviewCard';
import { createRating } from '@/redux/reviewSlice';
import { toast } from 'sonner';
import { Users } from 'lucide-react';


import Calendar from 'react-calendar'; // You'll need to install this: npm install react-calendar
import 'react-calendar/dist/Calendar.css';

const TechnicianProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);
  const [technician, setTechnician] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Rating submission state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [categories, setCategories] = useState({
    quality: 0,
    communication: 0,
    professionalism: 0,
    timeliness: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTechnicianData();
  }, [id]);

  const fetchTechnicianData = async () => {
    try {
      setLoading(true);
      // Fetch technician details
      const techResponse = await axios.get(`${TECHNICIAN_API_END_POINT}/${id}`, { withCredentials: true });

      if (techResponse.data.success) {
        setTechnician(techResponse.data.technician);

        // Fetch real ratings
        try {
          const ratingResponse = await axios.get(`${API_ENDPOINTS.RATING}/technician/${id}`, { withCredentials: true });
          if (ratingResponse.data.success) {
            setReviews(ratingResponse.data.data.ratings);
            setStats(ratingResponse.data.data.statistics);
          }
        } catch (ratingErr) {
          console.error("Error fetching ratings:", ratingErr);
          // Fallback to empty
        }
      } else {
        setError('Failed to load technician details');
      }
    } catch (err) {
      setError('Error fetching technician details');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (newRating === 0) {
      toast.error("Please select an overall rating");
      return;
    }

    try {
      setSubmitting(true);
      const ratingData = {
        ratedEntity: "technician",
        entityId: id,
        rating: newRating,
        review: reviewText,
        categories: categories
      };

      const response = await dispatch(createRating(ratingData));

      if (response && response.success) {
        toast.success("Review submitted successfully!");
        setShowRatingModal(false);
        setNewRating(0);
        setReviewText("");
        setCategories({ quality: 0, communication: 0, professionalism: 0, timeliness: 0 });
        // Refresh data
        fetchTechnicianData();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      // Error handling is done in the thunk/slice
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  return technician ? (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 p-4">

      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden mt-8">
        <div className="bg-blue-600 text-white p-6 flex items-center space-x-4">
          <img
            className="h-20 w-20 rounded-full object-cover border-2 border-white"
            src={technician.profile?.photo || '/default-avatar.png'}
            alt={technician.fullname}
          />
          <div>
            <h2 className="text-2xl font-semibold">{technician.fullname}</h2>
            <p className="text-blue-200">Technician</p>
          </div>
          {user && user._id !== technician._id && (
            <div className="ml-auto">
              <Button
                onClick={() => setShowRatingModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <MdStar className="mr-2" /> Rate Technician
              </Button>
            </div>
          )}
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stats</h3>
            <p><strong>Jobs Completed:</strong> {technician.jobsCompleted || '0'}</p>
            <div className="mt-2 flex items-center">
              <strong className="mr-2">Average Rating:</strong>
              <span className="flex items-center font-bold text-gray-900 border px-2 py-0.5 rounded bg-white">
                {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                <MdStar className="ml-1 text-yellow-500" />
              </span>
            </div>
            <p className="mt-2"><strong>Total Reviews:</strong> {stats.totalRatings || 0}</p>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h3>
            <p className="text-gray-600 flex items-center">
              <MdEmail className="mr-2 text-gray-500" /> {technician.email}
            </p>
            <p className="text-gray-600 flex items-center mt-2">
              <MdPhone className="mr-2 text-gray-500" /> {technician.phoneNumber}
            </p>
            <p className="text-gray-600 flex items-center mt-2">
              <MdLocationOn className="mr-2 text-gray-500" /> {technician.profile?.location || 'N/A'}
            </p>
          </div>

          {/* Skills & Experience */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills & Experience</h3>
            <p><strong>Skills:</strong> {technician.profile?.skills?.join(', ') || 'N/A'}</p>
            <p className="mt-2"><strong>Experience:</strong> {technician.profile?.experience || 'N/A'}</p>
          </div>

          {/* Reviews/Comments */}
          <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span>Reviews</span>
              <span className="text-sm font-normal text-gray-500">{reviews.length} reviews</span>
            </h3>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-white rounded border border-dashed">
                <MdComment className="mx-auto text-4xl mb-2 text-gray-300" />
                <p>No reviews yet. Be the first to leave one!</p>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Certifications</h3>
            {technician.certifications?.map((cert, index) => (
              <p key={index} className="flex items-center"><MdCheckCircle className="text-green-500 mr-1" /> {cert}</p>
            )) || <p>No certifications listed.</p>}
          </div>

          {/* Calendar */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Availability</h3>
            <Calendar value={calendarDate} onChange={setCalendarDate} />
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Rate {technician.fullname}</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Overall Rating</label>
              <RatingStar
                rating={newRating}
                onRatingChange={setNewRating}
                size="lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1">Quality</label>
                <RatingStar
                  rating={categories.quality}
                  onRatingChange={(val) => setCategories(prev => ({ ...prev, quality: val }))}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Communication</label>
                <RatingStar
                  rating={categories.communication}
                  onRatingChange={(val) => setCategories(prev => ({ ...prev, communication: val }))}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Professionalism</label>
                <RatingStar
                  rating={categories.professionalism}
                  onRatingChange={(val) => setCategories(prev => ({ ...prev, professionalism: val }))}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Timeliness</label>
                <RatingStar
                  rating={categories.timeliness}
                  onRatingChange={(val) => setCategories(prev => ({ ...prev, timeliness: val }))}
                  size="sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Review</label>
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows="4"
                placeholder="Share your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRatingModal(false)}>Cancel</Button>
              <Button onClick={handleRatingSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Technician not found</h3>
        <p className="mt-1 text-sm text-gray-500">The technician you are looking for does not exist.</p>
      </div>
    </div>
  );
};

export default TechnicianProfile;