import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const mockJobs = [
        {
          id: 1,
          title: 'Frontend Developer Needed',
          category: 'development',
          status: 'active',
          location: 'Remote',
          budget: 2500,
          applicants: 8,
          views: 45,
          postedDate: '2024-02-01',
          deadline: '2024-02-15'
        },
        {
          id: 2,
          title: 'UI/UX Designer',
          category: 'design',
          status: 'active',
          location: 'San Francisco, CA',
          budget: 3000,
          applicants: 12,
          views: 67,
          postedDate: '2024-02-05',
          deadline: '2024-02-20'
        }
      ];
      
      setJobs(mockJobs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
              <p className="text-gray-600">Manage your posted job opportunities</p>
            </div>
            <button
              onClick={() => navigate('/app/recruiter/jobs/create')}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Post New Job</span>
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h3>
                  <p className="text-gray-600 text-sm capitalize">{job.category}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>

              {/* Job Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${job.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{job.applicants} applicants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{job.views} views</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Posted {formatDate(job.postedDate)}
                  </span>
                  <span className="text-gray-600 flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due {formatDate(job.deadline)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Jobs */}
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600">Start by posting your first job opportunity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
