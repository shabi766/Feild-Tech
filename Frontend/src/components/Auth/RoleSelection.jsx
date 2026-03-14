import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Users, Wrench, ArrowLeft, Building, User } from 'lucide-react';
import posthog from 'posthog-js';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [showRecruiterOptions, setShowRecruiterOptions] = useState(false);

  const handleRoleSelect = (role, recruiterType = null) => {
    posthog.capture('role_selection_click', { role, recruiterType });
    if (role === 'Recruiter' && !recruiterType) {
      setShowRecruiterOptions(true);
    } else {
      navigate('/signup', { 
        state: { 
          selectedRole: role, 
          recruiterType: recruiterType 
        } 
      });
    }
  };

  const handleRecruiterTypeSelect = (recruiterType) => {
    posthog.capture('recruiter_type_select', { recruiterType });
    navigate('/signup', { 
      state: { 
        selectedRole: 'Recruiter', 
        recruiterType: recruiterType 
      } 
    });
  };

  if (showRecruiterOptions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <button 
              onClick={() => setShowRecruiterOptions(false)}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Role Selection
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Recruiter Type
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select how you'd like to operate on our platform
            </p>
          </div>

          {/* Recruiter Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Individual Recruiter Card */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Individual Recruiter</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Post jobs for yourself and manage your own hiring needs. 
                  Perfect for freelancers, consultants, and individual professionals.
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Post jobs for personal projects
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Direct communication with technicians
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Simple project management
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Personal wallet and payments
                  </li>
                </ul>
                <Button 
                  onClick={() => handleRecruiterTypeSelect('Individual')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Sign Up as Individual
                </Button>
              </div>
            </Card>

            {/* Company Recruiter Card */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Recruiter</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Manage multiple clients, projects, and teams. 
                  Ideal for agencies, companies, and professional recruiters.
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Manage multiple clients and projects
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Team collaboration features
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Advanced project templates
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Company wallet and billing
                  </li>
                </ul>
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleRecruiterTypeSelect('Company')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Sign Up as Company
                  </Button>
                                <Link
                to="/company-registration"
                className="block w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Company Registration
              </Link>

                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Path
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to use our platform and start your journey today
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Recruiter Card */}
          <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Recruiter</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Post jobs, find skilled technicians, and manage your hiring process efficiently. 
                Connect with qualified professionals for your projects.
              </p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Post unlimited job listings
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Access verified technician profiles
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Manage applications and communications
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Track project progress and payments
                </li>
              </ul>
              <Button 
                onClick={() => handleRoleSelect('Recruiter')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Sign Up as Recruiter
              </Button>
            </div>
          </Card>

          {/* Technician Card */}
          <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-teal-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-10 h-10 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Technician</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Find exciting job opportunities, showcase your skills, and grow your career. 
                Connect with recruiters and secure your next project.
              </p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Browse and apply to jobs
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Create a professional profile
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Receive job notifications
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Track earnings and work history
                </li>
              </ul>
              <Button 
                onClick={() => handleRoleSelect('Technician')}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Sign Up as Technician
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

