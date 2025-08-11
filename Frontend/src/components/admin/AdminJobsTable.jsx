import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Edit2, Eye, MoreHorizontal, Calendar, Building2, Users, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from "framer-motion";

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const [activeTab, setActiveTab] = useState('All');
    const navigate = useNavigate();

    const jobStatuses = [
        { name: 'All', icon: Users, color: 'from-gray-500 to-gray-600' },
        { name: 'Active', icon: CheckCircle, color: 'from-green-500 to-green-600' },
        { name: 'Draft', icon: AlertCircle, color: 'from-yellow-500 to-yellow-600' },
        { name: 'Assigned', icon: Clock, color: 'from-blue-500 to-blue-600' },
        { name: 'Pending', icon: Clock, color: 'from-orange-500 to-orange-600' },
        { name: 'In Progress', icon: Clock, color: 'from-purple-500 to-purple-600' },
        { name: 'Done', icon: CheckCircle, color: 'from-green-600 to-green-700' },
        { name: 'Complete', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
        { name: 'Cancelled', icon: XCircle, color: 'from-red-500 to-red-600' }
    ];

    useEffect(() => {
        const filteredJobs = allAdminJobs.filter((job) => {
            const matchesSearch = !searchJobByText ||
                job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
                job?.Company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());

            const matchesStatus = activeTab === 'All' || job?.status === activeTab;

            return matchesSearch && matchesStatus;
        });

        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText, activeTab]);

    const handleJobClick = (jobId, status) => {
        if (status === 'Draft') {
            navigate(`/app/recruiter/jobs/create?jobId=${jobId}`);
        } else {
            navigate(`/app/recruiter/viewjob/${jobId}`);
        }
    };

    const getStatusColor = (status) => {
        const statusConfig = {
            'Active': 'bg-green-100 text-green-800 border-green-200',
            'Draft': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Assigned': 'bg-blue-100 text-blue-800 border-blue-200',
            'Pending': 'bg-orange-100 text-orange-800 border-orange-200',
            'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
            'Done': 'bg-green-100 text-green-800 border-green-200',
            'Complete': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <div className="p-6">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
                {jobStatuses.map((status) => (
                    <motion.button
                        key={status.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(status.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg ${
                            activeTab === status.name 
                                ? `bg-gradient-to-r ${status.color} text-white shadow-xl` 
                                : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-xl border border-gray-200'
                        }`}
                    >
                        <status.icon className="w-4 h-4" />
                        {status.name}
                    </motion.button>
                ))}
            </div>

            {/* Results Count */}
            <motion.div 
                className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20"
                variants={itemVariants}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700 font-medium">
                            Showing {filterJobs.length} of {allAdminJobs.length} jobs
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </motion.div>

            {/* Jobs Table */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
            >
                <Table>
                    <TableCaption className="text-lg font-semibold text-gray-700 py-4">
                        A comprehensive list of your job postings
                    </TableCaption>
                    <TableHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <TableRow>
                            <TableHead className="text-white font-semibold">Company</TableHead>
                            <TableHead className="text-white font-semibold">Role</TableHead>
                            <TableHead className="text-white font-semibold">Status</TableHead>
                            <TableHead className="text-white font-semibold">Date Posted</TableHead>
                            <TableHead className="text-white font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {filterJobs?.map((job, index) => (
                                <motion.tr
                                    key={job._id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    whileHover={{ 
                                        scale: 1.01,
                                        backgroundColor: "rgba(59, 130, 246, 0.05)"
                                    }}
                                    className={`transition-all duration-300 cursor-pointer ${
                                        job.status === 'Draft' ? 'bg-yellow-50/50' : ''
                                    }`}
                                >
                                    <TableCell 
                                        onClick={() => handleJobClick(job._id, job.status)} 
                                        className="cursor-pointer font-medium text-gray-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{job?.Company?.name}</div>
                                                <div className="text-sm text-gray-500">Company</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell 
                                        onClick={() => handleJobClick(job._id, job.status)} 
                                        className="cursor-pointer"
                                    >
                                        <div>
                                            <div className="font-semibold text-gray-800">{job?.title}</div>
                                            <div className="text-sm text-gray-500">Position</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job?.status)}`}>
                                            {job?.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700">
                                                {new Date(job?.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                                                </motion.button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-2 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-xl">
                                                <div className="space-y-1">
                                                    <motion.button
                                                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                                                        onClick={() => navigate(`/app/recruiter/jobs/${job._id}`)}
                                                        className='flex items-center gap-3 w-full p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-left'
                                                    >
                                                        <Edit2 className='w-4 h-4 text-blue-600' />
                                                        <span className="text-gray-700 font-medium">Edit Job</span>
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                                                        onClick={() => navigate(`/app/recruiter/jobs/${job._id}/applicants`)}
                                                        className='flex items-center gap-3 w-full p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-left'
                                                    >
                                                        <Users className='w-4 h-4 text-green-600' />
                                                        <span className="text-gray-700 font-medium">View Applicants</span>
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                                                        onClick={() => navigate(`/app/recruiter/viewjob/${job._id}`)}
                                                        className='flex items-center gap-3 w-full p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-left'
                                                    >
                                                        <Eye className='w-4 h-4 text-purple-600' />
                                                        <span className="text-gray-700 font-medium">View Details</span>
                                                    </motion.button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </motion.div>

            {/* Empty State */}
            {filterJobs.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                >
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search criteria or create a new job posting.</p>
                    <Button 
                        onClick={() => navigate("/admin/jobs/create")}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Create New Job
                    </Button>
                </motion.div>
            )}
        </div>
    );
};

export default AdminJobsTable;