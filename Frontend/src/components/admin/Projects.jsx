import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import useGetAllProjects from '../Hooks/useGetAllProjects'
import { setSearchProjectsByText } from '@/redux/projectSlice'
import ProjectTable from './ProjectTable'
import Footer from '../shared/Footer'
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  FolderOpen, 
  Filter,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  CheckCircle
} from "lucide-react";

const Projects = () => {
  useGetAllProjects();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allProjects } = useSelector(store => store.project);

  useEffect(()=>{
dispatch(setSearchProjectsByText(input));
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

  // Calculate project statistics
  const totalProjects = allProjects?.length || 0;
  const activeProjects = allProjects?.filter(project => project.status === 'Active' || project.status === 'In Progress')?.length || 0;
  const completedProjects = allProjects?.filter(project => project.status === 'Completed' || project.status === 'Done')?.length || 0;

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
                Project Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Track and manage all your projects and their progress
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate("/admin/projects/create")}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Project
              </Button>
            </motion.div>
      </div>
      
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                title: "Total Projects", 
                value: totalProjects, 
                icon: FolderOpen, 
                color: "from-emerald-500 to-emerald-600",
                description: "All projects in the system"
              },
              { 
                title: "Active Projects", 
                value: activeProjects, 
                icon: Clock, 
                color: "from-blue-500 to-blue-600",
                description: "Currently active"
              },
              { 
                title: "Completed", 
                value: completedProjects, 
                icon: CheckCircle, 
                color: "from-green-500 to-green-600",
                description: "Completed projects"
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
                    animate={{ width: `${(stat.value / Math.max(totalProjects, 1)) * 100}%` }}
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
                className="pl-10 pr-4 py-3 bg-white/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                placeholder="Search projects by name, client, or status..."
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

        {/* Projects Table */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
        >
          <ProjectTable />
        </motion.div>
    </div>
    </motion.div>
  )
}

export default Projects