import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { JOB_API_END_POINT } from '../utils/constant';
import { toast } from 'sonner';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    User,
    Building2,
    CheckCircle,
    AlertCircle,
    Filter,
    Search,
    RefreshCw,
    TrendingUp,
    Users,
    DollarSign,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const localizer = momentLocalizer(moment);

const EnhancedJobCalendar = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedView, setSelectedView] = useState(Views.MONTH);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const { user } = useSelector(store => store.auth);

    // Get job status color with better contrast
    const getStatusColor = (status) => {
        const colors = {
            'Draft': '#6B7280',
            'Active': '#2563EB',
            'Assigned': '#D97706',
            'In Progress': '#7C3AED',
            'Done': '#059669',
            'Complete': '#047857',
            'Review': '#EA580C',
            'Cancel': '#DC2626',
            'Paid': '#065F46'
        };
        return colors[status] || '#6B7280';
    };

    // Get job status icon with better visual hierarchy
    const getStatusIcon = (status) => {
        const icons = {
            'Draft': <AlertCircle size={18} />,
            'Active': <Clock size={18} />,
            'Assigned': <User size={18} />,
            'In Progress': <Clock size={18} />,
            'Done': <CheckCircle size={18} />,
            'Complete': <CheckCircle size={18} />,
            'Review': <AlertCircle size={18} />,
            'Cancel': <AlertCircle size={18} />,
            'Paid': <CheckCircle size={18} />
        };
        return icons[status] || <AlertCircle size={18} />;
    };

    // Fetch jobs based on user role
    const fetchJobs = async () => {
        try {
            setLoading(true);
            let response;

            if (user.role === 'Recruiter') {
                // Fetch jobs created by recruiter
                response = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    const jobEvents = response.data.jobs
                        .filter(job => job.startTime && job.endTime) // Only jobs with scheduled times
                        .map((job) => ({
                            id: job._id,
                            title: job.title,
                            start: new Date(job.startTime),
                            end: new Date(job.endTime),
                            location: job.location,
                            project: job.projectName?.name || 'No Project',
                            client: job.clientName?.name || 'No Client',
                            status: job.status,
                            description: job.description,
                            assignedTo: job.assignedApplicant?.name || 'Unassigned',
                            salary: job.totalSalary || 'Not specified',
                            requiredSkills: job.skills || [],
                            createdAt: job.createdAt,
                            type: 'recruiter'
                        }));
                    setEvents(jobEvents);
                }
            } else if (user.role === 'Technician') {
                // Fetch jobs assigned to or applied by technician
                response = await axios.get(`${JOB_API_END_POINT}/technician-jobs`, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    const allJobs = [
                        ...response.data.appliedJobs,
                        ...response.data.assignedJobs,
                        ...response.data.inProgressJobs,
                        ...response.data.doneJobs,
                        ...response.data.completedJobs
                    ];

                    const jobEvents = allJobs
                        .filter(job => job.startTime && job.endTime) // Only jobs with scheduled times
                        .map((job) => ({
                            id: job._id,
                            title: job.title,
                            start: new Date(job.startTime),
                            end: new Date(job.endTime),
                            location: job.location,
                            project: job.projectName?.name || 'No Project',
                            client: job.clientName?.name || 'No Client',
                            status: job.status,
                            description: job.description,
                            assignedTo: job.assignedApplicant?.name || 'Unassigned',
                            salary: job.totalSalary || 'Not specified',
                            requiredSkills: job.skills || [],
                            createdAt: job.createdAt,
                            type: 'technician'
                        }));
                    setEvents(jobEvents);
                }
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load scheduled jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [user]);

    // Filter events based on search and status
    useEffect(() => {
        let filtered = events;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(event => event.status === statusFilter);
        }

        setFilteredEvents(filtered);
    }, [events, searchTerm, statusFilter]);

    // Handle event click with better formatting
    const handleEventClick = (event) => {
        const eventDetails = `
🎯 Job: ${event.title}
📊 Status: ${event.status}
🏢 Client: ${event.client}
📋 Project: ${event.project}
👤 Assigned To: ${event.assignedTo}
📍 Location: ${event.location?.city || 'N/A'}, ${event.location?.country || 'N/A'}
⏰ Start: ${moment(event.start).format('LLL')}
⏰ End: ${moment(event.end).format('LLL')}
💰 Salary: ${event.salary}
🛠️ Skills: ${event.requiredSkills.join(', ') || 'None specified'}
        `;

        toast.info(eventDetails, {
            duration: 10000,
            position: 'top-center',
            style: {
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                lineHeight: '1.6',
                maxWidth: '400px'
            }
        });
    };

    // Enhanced custom event component
    const EventComponent = ({ event }) => (
        <motion.div
            className="relative p-3 text-white rounded-lg cursor-pointer shadow-lg border border-white/20 backdrop-blur-sm"
            style={{
                background: `linear-gradient(135deg, ${getStatusColor(event.status)} 0%, ${getStatusColor(event.status)}dd 100%)`,
                minHeight: '80px'
            }}
            whileHover={{
                scale: 1.03,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                zIndex: 10
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            {/* Status badge */}
            <div className="absolute -top-2 -right-2 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold shadow-md">
                {event.status}
            </div>

            {/* Event content */}
            <div className="space-y-2">
                <div className="font-bold text-sm leading-tight line-clamp-2">
                    {event.title}
                </div>

                {event.client !== 'No Client' && (
                    <div className="flex items-center gap-1 text-xs opacity-90">
                        <Building2 size={12} className="flex-shrink-0" />
                        <span className="truncate">{event.client}</span>
                    </div>
                )}

                {event.assignedTo !== 'Unassigned' && (
                    <div className="flex items-center gap-1 text-xs opacity-90">
                        <User size={12} className="flex-shrink-0" />
                        <span className="truncate">{event.assignedTo}</span>
                    </div>
                )}
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
    );

    // Enhanced custom toolbar component
    const CustomToolbar = (toolbar) => (
        <div className="mb-6 p-6 bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                {/* Left side - Title and role info */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            <CalendarIcon className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                {user?.role === 'Recruiter' ? 'Recruiter Job Calendar' : 'Technician Job Calendar'}
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">
                                Manage and track your scheduled jobs efficiently
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side - Quick stats */}
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{filteredEvents.length}</div>
                            <div className="text-xs text-gray-500">Total Jobs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {filteredEvents.filter(e => ['Done', 'Complete', 'Paid'].includes(e.status)).length}
                            </div>
                            <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {filteredEvents.filter(e => ['Active', 'Assigned', 'In Progress'].includes(e.status)).length}
                            </div>
                            <div className="text-xs text-gray-500">Active</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left side - View controls */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
                    <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
                        {Object.values(Views).map(view => (
                            <button
                                key={view}
                                onClick={() => toolbar.onView(view)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${toolbar.view === view
                                        ? 'bg-white text-blue-600 shadow-md transform scale-105'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right side - Search, filters, and refresh */}
                <div className="flex items-center gap-3">
                    {/* Enhanced Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search jobs, clients, projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 min-w-[280px]"
                        />
                    </div>

                    {/* Enhanced Filter button */}
                    <motion.button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${showFilters
                                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-md'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md'
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Filter size={18} />
                        <span className="hidden sm:inline">Filters</span>
                    </motion.button>

                    {/* Enhanced Refresh button */}
                    <motion.button
                        onClick={fetchJobs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh</span>
                    </motion.button>
                </div>
            </div>

            {/* Enhanced Filters panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="mt-6 pt-6 border-t border-gray-200"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Status Filter</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                    <option value="Complete">Complete</option>
                                    <option value="Review">Review</option>
                                    <option value="Cancel">Cancel</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Job Count</label>
                                <div className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl text-gray-700 font-bold text-lg text-center shadow-inner">
                                    {filteredEvents.length} of {events.length}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Actions</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setStatusFilter('all')}
                                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                                    >
                                        Show All
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('Active')}
                                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                                    >
                                        Active Only
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <RefreshCw className="mx-auto mb-4 text-blue-600" size={40} />
                    </motion.div>
                    <p className="text-gray-600 text-lg">Loading your scheduled jobs...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Custom Toolbar */}
                <CustomToolbar />

                {/* Enhanced Calendar */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                    <Calendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 700 }}
                        selectable
                        onSelectEvent={handleEventClick}
                        view={selectedView}
                        onView={setSelectedView}
                        components={{
                            event: EventComponent
                        }}
                        eventPropGetter={(event) => ({
                            style: {
                                backgroundColor: getStatusColor(event.status),
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                padding: '4px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }
                        })}
                        messages={{
                            noEventsInRange: 'No scheduled jobs in this time range',
                            today: 'Today',
                            previous: 'Previous',
                            next: 'Next',
                            month: 'Month',
                            week: 'Week',
                            day: 'Day',
                            agenda: 'Agenda'
                        }}
                        className="enhanced-calendar"
                    />
                </div>

                {/* Enhanced Legend */}
                <motion.div
                    className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Job Status Legend</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {['Draft', 'Active', 'Assigned', 'In Progress', 'Done', 'Complete', 'Review', 'Cancel', 'Paid'].map(status => (
                            <motion.div
                                key={status}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div
                                    className="w-4 h-4 rounded-full shadow-sm"
                                    style={{ backgroundColor: getStatusColor(status) }}
                                />
                                <span className="text-sm font-medium text-gray-700">{status}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Custom CSS for calendar enhancement */}
            <style jsx>{`
                .enhanced-calendar .rbc-calendar {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }
                
                .enhanced-calendar .rbc-header {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-bottom: 2px solid #e2e8f0;
                    font-weight: 600;
                    color: #374151;
                    padding: 12px 8px;
                }
                
                .enhanced-calendar .rbc-today {
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                }
                
                .enhanced-calendar .rbc-off-range-bg {
                    background: #f9fafb;
                }
                
                .enhanced-calendar .rbc-event {
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    border: none;
                }
                
                .enhanced-calendar .rbc-event:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </div>
    );
};

export default EnhancedJobCalendar;
