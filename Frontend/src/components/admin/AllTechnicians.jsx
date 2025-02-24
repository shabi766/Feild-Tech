import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TECHNICIAN_API_END_POINT } from '../utils/constant';
import { useNavigate } from 'react-router-dom';
import Footer from '../shared/Footer';
import Navbar from '../shared/Navbar';

const AllTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await axios.get(TECHNICIAN_API_END_POINT, { withCredentials: true });
        if (response.data.success) {
          setTechnicians(response.data.technicians);
        } else {
          setError('Failed to load technicians');
        }
      } catch (err) {
        setError('Error fetching technicians: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  const handleAddToTalentPool = (technician) => {
    const talentPool = JSON.parse(localStorage.getItem('talentPool') || '[]');
    talentPool.push(technician);
    localStorage.setItem('talentPool', JSON.stringify(talentPool));
    alert(`${technician.fullname} has been added to your talent pool.`);
  };

  const handleShowProfile = (technician) => {
    navigate(`/technicians/${technician._id}`);
  };

  const filteredTechnicians = technicians.filter((tech) =>
    tech.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.profile?.skills.some((skill) =>
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <div className="container mx-auto p-4 flex-grow">
        <h1 className="text-2xl font-bold mb-4">Technicians</h1>
        <input
          type="text"
          placeholder="Search technicians by name or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />

        {loading ? (
          <p>Loading technicians...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredTechnicians.length > 0 ? (
          <ul className="list-disc list-inside">
            {filteredTechnicians.map((technician) => (
              <li key={technician._id} className="mb-4 p-4 border rounded shadow">
                <h2 className="text-xl font-semibold">{technician.fullname}</h2>
                <p>Email: {technician.email}</p>
                <p>Phone: {technician.phoneNumber}</p>
                <p>Skills: {technician.profile?.skills.join(', ') || 'N/A'}</p>
                <button 
                  onClick={() => handleAddToTalentPool(technician)} 
                  className="mr-2 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add to Talent Pool
                </button>
                <button 
                  onClick={() => handleShowProfile(technician)} 
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Show Profile
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No technicians found</p>
        )}
      </div>

      <div className='mt-60'>
      <Footer  />

      </div>
      
    </div>
  );
};

export default AllTechnicians;
