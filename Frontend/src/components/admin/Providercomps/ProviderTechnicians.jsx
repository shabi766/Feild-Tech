import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { TECHNICIAN_API_END_POINT } from "@/components/utils/constant";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { ChatContext } from "@/context/ChatContext"; // ✅ Import Chat Context

const AllTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { startChatWithUser, setSelectedChat } = useContext(ChatContext); // ✅ Use Chat Context

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await axios.get(TECHNICIAN_API_END_POINT, { withCredentials: true });
        if (response.data.success) {
          setTechnicians(response.data.technicians);
        } else {
          setError("Failed to load technicians");
        }
      } catch (err) {
        setError("Error fetching technicians: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  const handleStartChat = async (technician) => {
    try {
      const chat = await startChatWithUser(technician._id);
      setSelectedChat(chat);
      navigate(`/chat?chatId=${chat._id}`); // ✅ Open chat directly
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleAddToTalentPool = (technician) => {
    const talentPool = JSON.parse(localStorage.getItem("talentPool") || "[]");
    talentPool.push(technician);
    localStorage.setItem("talentPool", JSON.stringify(talentPool));
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
              <li key={technician._id} className="mb-4 p-4 border rounded shadow flex justify-between items-center">
                {/* ✅ Technician Info */}
                <div>
                  <h2 className="text-xl font-semibold">{technician.fullname}</h2>
                  <p>Email: {technician.email}</p>
                  <p>Phone: {technician.phoneNumber}</p>
                  <p>Skills: {technician.profile?.skills.join(", ") || "N/A"}</p>
                </div>

                {/* ✅ Buttons Aligned Properly */}
                <div className="flex items-center gap-4 ml-auto">
                  <button onClick={() => handleAddToTalentPool(technician)} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Add to Talent Pool
                  </button>
                  <button onClick={() => handleShowProfile(technician)} className="bg-green-500 text-white px-4 py-2 rounded">
                    Show Profile
                  </button>
                  
                  {/* ✅ Chat Icon (Rightmost) */}
                  <button onClick={() => handleStartChat(technician)} className="p-2 rounded-full hover:bg-gray-200 transition">
                    <MessageCircle className="w-6 h-6 text-indigo-500 hover:text-indigo-700 transition" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No technicians found</p>
        )}
      </div>
    </div>
  );
};

export default AllTechnicians;
