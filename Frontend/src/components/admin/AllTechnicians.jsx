import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { TECHNICIAN_API_END_POINT } from '../utils/constant';
import { useNavigate } from 'react-router-dom';
import Footer from '../shared/Footer';
import { MessageCircle, Search, UserPlus, Eye, Star, MapPin, Mail, Phone, Briefcase, Filter } from 'lucide-react';
import { ChatContext } from '@/context/ChatContext';
import { motion, AnimatePresence } from "framer-motion";
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const AllTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { startChatWithUser, setSelectedChat } = useContext(ChatContext);

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

  const handleStartChat = async (technician) => {
    try {
        const chat = await startChatWithUser(technician._id);

        if (chat) {
            setSelectedChat(chat);
            navigate(`/chat?chatId=${chat._id}`);
        } else {
            console.error("Chat not created!");
        }
    } catch (error) {
        console.error("Error starting chat:", error);
    }
};

  const handleAddToTalentPool = (technician) => {
    const talentPool = JSON.parse(localStorage.getItem('talentPool') || '[]');
    talentPool.push(technician);
    localStorage.setItem('talentPool', JSON.stringify(talentPool));
    alert(`${technician.fullname} has been added to your talent pool.`);
  };

  const handleShowProfile = (technician) => {
    navigate(`/app/recruiter/technicians/${technician._id}`);
  };

  const filteredTechnicians = technicians.filter((tech) =>
    tech.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.profile?.skills.some((skill) =>
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading technicians...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Technicians</h3>
          <p className="text-red-500 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="mb-8"
          variants={cardVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Technician Directory
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Browse and connect with skilled technicians
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate("/admin/talentpool")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                View Talent Pool
              </Button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                title: "Total Technicians", 
                value: technicians.length, 
                icon: Briefcase, 
                color: "from-blue-500 to-blue-600",
                description: "All registered technicians"
              },
              { 
                title: "Available", 
                value: technicians.filter(t => t.status === 'Available').length, 
                icon: UserPlus, 
                color: "from-green-500 to-green-600",
                description: "Currently available"
              },
              { 
                title: "In Talent Pool", 
                value: JSON.parse(localStorage.getItem('talentPool') || '[]').length, 
                icon: Star, 
                color: "from-purple-500 to-purple-600",
                description: "Saved to talent pool"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.value / Math.max(technicians.length, 1)) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6"
          variants={cardVariants}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                className="pl-10 pr-4 py-3 bg-white/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          placeholder="Search technicians by name or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </motion.button>
                </div>
        </motion.div>

        {/* Technicians Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredTechnicians.map((technician, index) => (
              <motion.div
                key={technician._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                {/* Technician Avatar and Basic Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {technician.fullname.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{technician.fullname}</h3>
                    <p className="text-gray-600 text-sm">Technician</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{technician.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{technician.phoneNumber}</span>
                  </div>
                  {technician.profile?.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{technician.profile.location}</span>
                </div>
        )}
      </div>

                {/* Skills */}
                {technician.profile?.skills && technician.profile.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-700 font-medium mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {technician.profile.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {technician.profile.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{technician.profile.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartChat(technician)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShowProfile(technician)}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToTalentPool(technician)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    <Star className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredTechnicians.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No technicians found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria.</p>
          </motion.div>
        )}
    </div>
    </motion.div>
  );
};

export default AllTechnicians;
