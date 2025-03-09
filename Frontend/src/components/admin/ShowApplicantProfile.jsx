import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TECHNICIAN_API_END_POINT } from '../utils/constant';
import { useParams } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi'; // For loading spinner
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'; // Icons for better UX


const ShowApplicantProfile = () => {
    
  const { id } = useParams(); // Get technician ID from the URL
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <FiLoader className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }
  

  return technician ? (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={technician.profile?.photo || '/default-avatar.png'}
              alt={technician.fullname}
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{technician.fullname}</h2>
            <p className="text-gray-600 mt-1">Technician</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
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
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills & Experience</h3>
            <p><strong>Skills:</strong> {technician.profile?.skills.join(', ') || 'N/A'}</p>
            <p className="mt-2"><strong>Experience:</strong> {technician.profile?.experience || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-center mt-10">Technician not found</p>
  );
};



export default ShowApplicantProfile;
