import { Bookmark, MapPin, Clock, DollarSign, Building, Calendar, Star, ArrowRight, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

const Workorder = ({ job }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    const days = Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const { street, city, state, postalCode, country } = job?.location || {};

  const getJobTypeColor = (jobType) => {
    switch (jobType?.toLowerCase()) {
      case 'full-time': return 'from-blue-500 to-indigo-600';
      case 'part-time': return 'from-green-500 to-emerald-600';
      case 'contract': return 'from-purple-500 to-pink-600';
      case 'freelance': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getWorkTypeColor = (workType) => {
    switch (workType?.toLowerCase()) {
      case 'remote': return 'from-emerald-500 to-teal-600';
      case 'onsite': return 'from-blue-500 to-cyan-600';
      case 'hybrid': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    
    if (salary.payableSalary) return `$${salary.payableSalary}`;
    if (salary.rate) return `$${salary.rate}`;
    if (salary.totalSalary) return `$${salary.totalSalary}`;
    if (salary.partTime?.hourlyRate) return `$${salary.partTime.hourlyRate}/hr`;
    if (salary.fullTime?.contractRate) return `$${salary.fullTime.contractRate}`;
    
    return 'Salary not specified';
  };

  return (
    <motion.div
      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 hover-lift overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => navigate(`/app/technician/description/${job._id}`)}
    >
      {/* Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Header Section */}
      <div className="p-6 border-b border-gray-100/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">
              {daysAgoFunction(job?.createdAt)}
            </span>
          </div>
          <motion.button
            className={`p-2 rounded-full transition-all duration-300 ${
              isBookmarked 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Company Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-gray-200">
              <AvatarImage src={job?.Company?.logo} />
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {job?.title}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {job?.company?.name || job?.Company?.name}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {city}, {state}, {country}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
          {job?.description}
        </p>

        {/* Requirements */}
        {job?.requirements && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-2">Requirements</p>
            <p className="text-sm text-gray-700">{job.requirements}</p>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job?.jobType && (
            <Badge className={`bg-gradient-to-r ${getJobTypeColor(job.jobType)} text-white border-0`}>
              {job.jobType}
            </Badge>
          )}
          {job?.workType && (
            <Badge className={`bg-gradient-to-r ${getWorkTypeColor(job.workType)} text-white border-0`}>
              {job.workType}
            </Badge>
          )}
          <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
            {formatSalary(job?.salary)}
          </Badge>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {job?.experience && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{job.experience} yrs exp</span>
            </div>
          )}
          {job?.skills && job.skills.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4" />
              <span>{job.skills.length} skills</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-6 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Posted {daysAgoFunction(job?.createdAt)}</span>
          </div>
          <motion.div
            className="flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

      {/* Floating Sparkles Effect */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-blue-400"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50]
              }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.2,
                ease: "easeOut"
              }}
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`
              }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Workorder;