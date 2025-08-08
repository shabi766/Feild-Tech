import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { TECHNICIAN_API_END_POINT } from "@/components/utils/constant";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { ChatContext } from "@/context/ChatContext"; // ✅ Import Chat Context
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AllTechnicians = ({ pools = [], selectedPoolId, onSelectPool, onAddToPool }) => {
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Technicians</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Add to:</span>
              <select
                className="h-9 border rounded px-2"
                value={selectedPoolId || ''}
                onChange={(e) => onSelectPool?.(e.target.value)}
              >
                <option value="" disabled>Select pool</option>
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search technicians by name or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {loading ? (
            <p>Loading technicians...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredTechnicians.length > 0 ? (
            <ul className="space-y-3">
              {filteredTechnicians.map((technician) => (
                <li key={technician._id} className="p-4 border rounded flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-semibold">{technician.fullname}</h2>
                    <p className="text-sm text-gray-600">{technician.email}</p>
                    <p className="text-sm text-gray-600">{technician.phoneNumber}</p>
                    <p className="text-sm text-gray-600">Skills: {technician.profile?.skills.join(", ") || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => selectedPoolId && onAddToPool?.(selectedPoolId, technician)}
                      disabled={!selectedPoolId}
                      size="sm"
                    >
                      Add to Pool
                    </Button>
                    <Button onClick={() => handleShowProfile(technician)} size="sm" variant="outline">
                      Profile
                    </Button>
                    <Button onClick={() => handleStartChat(technician)} size="icon" variant="ghost">
                      <MessageCircle className="w-5 h-5 text-indigo-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No technicians found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllTechnicians;
