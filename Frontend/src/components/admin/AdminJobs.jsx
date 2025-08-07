import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '../Hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'
import Footer from '../shared/Footer'
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  Briefcase, 
  Filter,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allAdminJobs } = useSelector(store => store.job);

  useEffect(()=>{
dispatch(setSearchJobByText(input));
  },[input]);

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

  // Calculate actual statistics from real data
  const totalJobs = allAdminJobs?.length || 0;
  const activeJobs = allAdminJobs?.filter(job => job.status === 'Active' || job.status === 'In Progress')?.length || 0;
  const completedJobs = allAdminJobs?.filter(job => job.status === 'Completed' || job.status === 'Done')?.length || 0;

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className='max-w-7xl mx-auto'>
        {/* Header Section */}
        <motion.div 
          className="mb-8"
          variants={cardVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Job Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Create, manage, and track all your job postings
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate("/admin/jobs/create")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </Button>
            </motion.div>
      </div>
      
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                title: "Total Jobs", 
                value: totalJobs, 
                icon: Briefcase, 
                color: "from-blue-500 to-blue-600",
                description: "All job postings"
              },
              { 
                title: "Active Jobs", 
                value: activeJobs, 
                icon: TrendingUp, 
                color: "from-green-500 to-green-600",
                description: "Currently active"
              },
              { 
                title: "Completed", 
                value: completedJobs, 
                icon: Users, 
                color: "from-purple-500 to-purple-600",
                description: "Completed jobs"
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
                    animate={{ width: `${(stat.value / Math.max(totalJobs, 1)) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6"
          variants={cardVariants}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                className="pl-10 pr-4 py-3 bg-white/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Search jobs by title, description, or requirements..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
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

        {/* Jobs Table */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
        >
          <AdminJobsTable />
        </motion.div>
    </div>
    </motion.div>
  )
}

export default AdminJobs