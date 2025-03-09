import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TECHNICIAN_API_END_POINT } from '../utils/constant';
import { useParams } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { MdEmail, MdPhone, MdLocationOn, MdStar, MdComment, MdCheckCircle } from 'react-icons/md';


import Calendar from 'react-calendar'; // You'll need to install this: npm install react-calendar
import 'react-calendar/dist/Calendar.css';

const TechnicianProfile = () => {
  const { id } = useParams();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const fetchTechnician = async () => {
      try {
        const response = await axios.get(`${TECHNICIAN_API_END_POINT}/${id}`, { withCredentials: true });
        if (response.data.success) {
          setTechnician(response.data.technician);
        } else {
          setError('Failed to load technician details');
        }
      } catch (err) {
        setError('Error fetching technician details');
      } finally {
        setLoading(false);
      }
    };

    fetchTechnician();
  }, [id]);

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
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stats</h3>
            <p><strong>Jobs Completed:</strong> {technician.jobsCompleted || 'N/A'}</p>
            <p className="mt-2"><strong>Average Rating:</strong> {technician.averageRating || 'N/A'} <MdStar className="inline text-yellow-500" /></p>
            <p className="mt-2"><strong>Total Reviews:</strong> {technician.reviews?.length || 0}</p>
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
            <p><strong>Skills:</strong> {technician.profile?.skills.join(', ') || 'N/A'}</p>
            <p className="mt-2"><strong>Experience:</strong> {technician.profile?.experience || 'N/A'}</p>
          </div>

          {/* Reviews/Comments */}
          <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reviews</h3>
            {technician.reviews?.map((review, index) => (
              <div key={index} className="border-b pb-2 mb-2">
                <p className="flex items-center"><MdStar className="text-yellow-500 mr-1" />{review.rating}</p>
                <p className="flex items-center"><MdComment className="text-gray-500 mr-1" />{review.comment}</p>
              </div>
            )) || <p>No reviews yet.</p>}
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
      <div className="mt-8">
        
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-100">
      
      <p className="text-center mt-20">Technician not found</p>
      <div className="mt-60">
       
      </div>
    </div>
  );
};

export default TechnicianProfile;