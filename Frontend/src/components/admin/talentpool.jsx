// TalentPool.jsx
import React, { useState, useEffect } from 'react';
import Footer from '../shared/Footer';


const TalentPool = () => {
  const [talentPool, setTalentPool] = useState([]);

  useEffect(() => {
    const savedTechnicians = JSON.parse(localStorage.getItem('talentPool')) || [];
    setTalentPool(savedTechnicians);
  }, []);

  return (
    <div>
     
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Talent Pool</h1>
      {talentPool.length > 0 ? (
        <ul className="list-disc list-inside">
          {talentPool.map((tech, index) => (
            <li key={index} className="mb-4 p-4 border rounded shadow">
              <h2 className="text-xl font-semibold">{tech.fullname}</h2>
              <p>Email: {tech.email}</p>
              <p>Phone: {tech.phoneNumber}</p>
              <p>Skills: {tech.profile?.skills.join(', ') || 'N/A'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No technicians in the talent pool.</p>
      )}
      
    </div>
   
    </div>
  );
};

export default TalentPool;