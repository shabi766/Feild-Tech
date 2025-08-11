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
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const localizer = momentLocalizer(moment);

const JobCalendar = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedView, setSelectedView] = useState(Views.MONTH);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const { user } = useSelector(store => store.auth);

    // Get job status color
    const getStatusColor = (status) => {
        const colors = {
            'Draft': '#6B7280',
            'Active': '#3B82F6',
            'Assigned': '#F59E0B',
            'In Progress': '#8B5CF6',
            'Done': '#10B981',
            'Complete': '#059669',
            'Review': '#F97316',
            'Cancel': '#EF4444',
            'Paid': '#059669'
        };
        return colors[status] || '#6B7280';
    };

    // Get job status icon
    const getStatusIcon = (status) => {
        const icons = {
            'Draft': <AlertCircle size={16} />,
            'Active': <Clock size={16} />,
            'Assigned': <User size={16} />,
            'In Progress': <Clock size={16} />,
            'Done': <CheckCircle size={16} />,
            'Complete': <CheckCircle size={16} />,
            'Review': <AlertCircle size={16} />,
            'Cancel': <AlertCircle size={16} />,
            'Paid': <CheckCircle size={16} />
        };
        return icons[status] || <AlertCircle size={16} />;
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

    // Handle event click
    const handleEventClick = (event) => {
        const eventDetails = `
Job: ${event.title}
Status: ${event.status}
Client: ${event.client}
Project: ${event.project}
Assigned To: ${event.assignedTo}
Location: ${event.location?.city || 'N/A'}, ${event.location?.country || 'N/A'}
Start: ${moment(event.start).format('LLL')}
End: ${moment(event.end).format('LLL')}
Salary: ${event.salary}
Skills: ${event.requiredSkills.join(', ') || 'None specified'}
        `;
        
        toast.info(eventDetails, {
            duration: 8000,
            position: 'top-center',
        });
    };

    // Custom event component
    const EventComponent = ({ event }) => (
        <motion.div
            className="p-2 text-xs text-white rounded cursor-pointer"
            style={{ backgroundColor: getStatusColor(event.status) }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="font-semibold truncate">{event.title}</div>
            <div className="flex items-center gap-1 mt-1">
                {getStatusIcon(event.status)}
                <span className="truncate">{event.status}</span>
            </div>
            {event.client !== 'No Client' && (
                <div className="truncate mt-1 opacity-90">
                    <Building2 size={12} className="inline mr-1" />
                    {event.client}
                </div>
            )}
        </motion.div>
    );

    // Custom toolbar component
    const CustomToolbar = (toolbar) => (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left side - Title and View controls */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" size={24} />
                        <h2 className="text-2xl font-bold text-gray-800">
                            {user?.role === 'Recruiter' ? 'Recruiter Job Calendar' : 'Technician Job Calendar'}
                        </h2>
                    </div>
                    
                    {/* View controls */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {Object.values(Views).map(view => (
                            <button
                                key={view}
                                onClick={() => toolbar.onView(view)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    toolbar.view === view
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right side - Search, filters, and refresh */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            showFilters 
                                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Filter size={16} />
                        Filters
                    </button>

                    {/* Refresh button */}
                    <button
                        onClick={fetchJobs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                    >
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Jobs</label>
                                <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                                    {filteredEvents.length} of {events.length}
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
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                    <p className="text-gray-600">Loading scheduled jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Custom Toolbar */}
                <CustomToolbar />
                
                {/* Calendar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <Calendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }}
                        selectable
                        onSelectEvent={handleEventClick}
                        view={selectedView}
                        onView={setSelectedView}
                        components={{
                            event: EventComponent,
                            toolbar: CustomToolbar
                        }}
                        eventPropGetter={(event) => ({
                            style: { 
                                backgroundColor: getStatusColor(event.status),
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                padding: '4px'
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
                    />
                </div>

                {/* Legend */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Status Legend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['Draft', 'Active', 'Assigned', 'In Progress', 'Done', 'Complete', 'Review', 'Cancel', 'Paid'].map(status => (
                            <div key={status} className="flex items-center gap-2">
                                <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: getStatusColor(status) }}
                                />
                                <span className="text-sm text-gray-700">{status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCalendar;
