import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Briefcase,
  Download
} from 'lucide-react';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const statuses = [
    'all', 'applied', 'under-review', 'shortlisted', 'interview-scheduled', 'hired', 'rejected'
  ];

  const experienceLevels = [
    'all', 'entry', 'intermediate', 'expert'
  ];

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    filterApplicants();
  }, [searchTerm, statusFilter, experienceFilter, applicants]);

  const fetchApplicants = async () => {
    try {
      // Mock data - replace with actual API call
      const mockApplicants = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          position: 'Frontend Developer',
          experience: 'intermediate',
          rating: 4.5,
          status: 'shortlisted',
          appliedDate: '2024-02-10',
          skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
          resume: 'john_smith_resume.pdf',
          coverLetter: 'Experienced frontend developer with 3+ years...',
          availability: 'Immediate',
          expectedSalary: 75000,
          lastContact: '2024-02-12'
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+1 (555) 987-6543',
          location: 'San Francisco, CA',
          position: 'UI/UX Designer',
          experience: 'expert',
          rating: 4.8,
          status: 'interview-scheduled',
          appliedDate: '2024-02-08',
          skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
          resume: 'sarah_johnson_resume.pdf',
          coverLetter: 'Senior UI/UX designer passionate about...',
          availability: '2 weeks notice',
          expectedSalary: 95000,
          lastContact: '2024-02-11'
        },
        {
          id: 3,
          name: 'Mike Davis',
          email: 'mike.davis@email.com',
          phone: '+1 (555) 456-7890',
          location: 'Austin, TX',
          position: 'Backend Developer',
          experience: 'entry',
          rating: 4.2,
          status: 'under-review',
          appliedDate: '2024-02-12',
          skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
          resume: 'mike_davis_resume.pdf',
          coverLetter: 'Recent graduate with strong backend...',
          availability: 'Immediate',
          expectedSalary: 65000,
          lastContact: '2024-02-12'
        },
        {
          id: 4,
          name: 'Emily Chen',
          email: 'emily.chen@email.com',
          phone: '+1 (555) 321-0987',
          location: 'Seattle, WA',
          position: 'Full Stack Developer',
          experience: 'intermediate',
          rating: 4.6,
          status: 'applied',
          appliedDate: '2024-02-13',
          skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
          resume: 'emily_chen_resume.pdf',
          coverLetter: 'Versatile developer with experience in...',
          availability: '1 week notice',
          expectedSalary: 85000,
          lastContact: '2024-02-13'
        }
      ];
      
      setApplicants(mockApplicants);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setLoading(false);
    }
  };

  const filterApplicants = () => {
    let filtered = applicants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(applicant =>
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === statusFilter);
    }

    // Experience filter
    if (experienceFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.experience === experienceFilter);
    }

    setFilteredApplicants(filtered);
  };

  const updateApplicantStatus = async (applicantId, newStatus) => {
    try {
      setApplicants(prev => prev.map(applicant =>
        applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
      ));
    } catch (error) {
      console.error('Error updating applicant status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-gray-100 text-gray-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'interview-scheduled': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getExperienceLabel = (experience) => {
    return experience.charAt(0).toUpperCase() + experience.slice(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApplicantClick = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailModal(true);
  };

  const handleDownloadResume = (applicant) => {
    // Mock download - replace with actual implementation
    console.log('Downloading resume for:', applicant.name);
  };

  const handleSendMessage = (applicant) => {
    // Mock message - replace with actual implementation
    console.log('Sending message to:', applicant.name);
  };

  const handleScheduleInterview = (applicant) => {
    // Mock interview scheduling - replace with actual implementation
    console.log('Scheduling interview for:', applicant.name);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Applicants</h1>
          <p className="text-gray-600">Manage and review job applications</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applicants by name, position, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div className="lg:w-48">
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {experienceLevels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Experience' : getExperienceLabel(level)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Applicants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplicants.map(applicant => (
            <div
              key={applicant.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleApplicantClick(applicant)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{applicant.name}</h3>
                  <p className="text-gray-600">{applicant.position}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{applicant.rating}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{applicant.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{applicant.location}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {applicant.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{applicant.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                  {getStatusLabel(applicant.status)}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadResume(applicant);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Download Resume"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendMessage(applicant);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Send Message"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Applied Date */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Applied {formatDate(applicant.appliedDate)}</span>
                  <span className="capitalize">{getExperienceLabel(applicant.experience)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredApplicants.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}

        {/* Applicant Detail Modal */}
        {showDetailModal && selectedApplicant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedApplicant.name}</h2>
                    <p className="text-gray-600">{selectedApplicant.position}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Applicant Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{selectedApplicant.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{selectedApplicant.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{selectedApplicant.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedApplicant.coverLetter}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Status and Actions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Status & Actions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Current Status:</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplicant.status)}`}>
                            {getStatusLabel(selectedApplicant.status)}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleScheduleInterview(selectedApplicant)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Schedule Interview
                          </button>
                          <button
                            onClick={() => handleSendMessage(selectedApplicant)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Send Message
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience Level:</span>
                          <span className="text-gray-900 capitalize">{getExperienceLabel(selectedApplicant.experience)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Availability:</span>
                          <span className="text-gray-900">{selectedApplicant.availability}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Salary:</span>
                          <span className="text-gray-900">${selectedApplicant.expectedSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Applied Date:</span>
                          <span className="text-gray-900">{formatDate(selectedApplicant.appliedDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Contact:</span>
                          <span className="text-gray-900">{formatDate(selectedApplicant.lastContact)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Resume Download */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
                      <button
                        onClick={() => handleDownloadResume(selectedApplicant)}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Resume</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statuses.filter(status => status !== 'all').map(status => (
                      <button
                        key={status}
                        onClick={() => updateApplicantStatus(selectedApplicant.id, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedApplicant.status === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;

