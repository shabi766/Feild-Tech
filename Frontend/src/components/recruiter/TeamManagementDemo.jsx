import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  FileText,
  Building,
  Crown
} from 'lucide-react';

const TeamManagementDemo = () => {
  const [demoStep, setDemoStep] = useState(1);
  const [showCredentials, setShowCredentials] = useState(false);

  const demoCredentials = {
    email: "john.doe@company.com",
    password: "a1b2c3d4",
    loginUrl: "https://app.company.com/login"
  };

  const copyCredentials = () => {
    const text = `Email: ${demoCredentials.email}\nPassword: ${demoCredentials.password}\nLogin URL: ${demoCredentials.loginUrl}`;
    navigator.clipboard.writeText(text);
    alert('Credentials copied to clipboard!');
  };

  const downloadCredentials = () => {
    const text = `User Credentials for John Doe\n\nEmail: ${demoCredentials.email}\nPassword: ${demoCredentials.password}\nLogin URL: ${demoCredentials.loginUrl}\n\nPlease provide these credentials to the user securely.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'John_Doe_credentials.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Team Management System
          </h1>
          <p className="text-gray-600 text-lg">
            See how managers can create accounts for team members with automatic role assignment
          </p>
        </div>

        {/* Demo Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${demoStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${demoStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {demoStep === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Company Manager Access
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                As a company manager, you have full access to create and manage team member accounts.
                You can invite individual users or bulk invite multiple team members at once.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Crown className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">Manager Role</h3>
                  <p className="text-sm text-blue-700">Full company access</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-900">User Creation</h3>
                  <p className="text-sm text-green-700">Create team accounts</p>
                </div>
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/30">
                  <Shield className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-accent-dark">Permission Control</h3>
                  <p className="text-sm text-accent-dark">Manage access levels</p>
                </div>
              </div>
              <button
                onClick={() => setDemoStep(2)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next: Invite User
              </button>
            </div>
          )}

          {demoStep === 2 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Invite New Team Member
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Invite a new team member by providing their basic information.
                The system will automatically create their account and assign them the "Recruiter" role.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Invitation Form</h3>
                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">
                      John Doe
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">
                      john.doe@company.com
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">
                      +1 (555) 123-4567
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Assignment</label>
                    <div className="px-3 py-2 bg-green-100 border border-green-300 rounded-md text-green-800">
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Auto-assign as Recruiter
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDemoStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setDemoStep(3)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Next: Account Creation
                </button>
              </div>
            </div>
          )}

          {demoStep === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Account Created Successfully
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                The system has automatically created John's account and assigned him the Recruiter role.
                Now you can share the login credentials with him so he can start working immediately.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Account Creation Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>User account created</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Email: john.doe@company.com</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Role: Recruiter (auto-assigned)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Company access granted</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Login credentials generated</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Ready for immediate use</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDemoStep(2)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setDemoStep(4);
                    setShowCredentials(true);
                  }}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Next: View Credentials
                </button>
              </div>
            </div>
          )}

          {demoStep === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Login Credentials Generated
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Here are John's login credentials. You can copy them to clipboard or download them as a text file
                to share securely with John. He can use these credentials to login immediately.
              </p>

              {showCredentials && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                  <h3 className="font-semibold text-yellow-800 mb-4 flex items-center justify-center">
                    <Key className="h-5 w-5 mr-2" />
                    Login Credentials for John Doe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="block text-sm font-medium text-yellow-700 mb-1">Email</span>
                      <div className="px-3 py-2 bg-white border border-yellow-300 rounded-md font-mono text-sm">
                        {demoCredentials.email}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-yellow-700 mb-1">Password</span>
                      <div className="px-3 py-2 bg-white border border-yellow-300 rounded-md font-mono text-sm">
                        {demoCredentials.password}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-yellow-700 mb-1">Login URL</span>
                      <div className="px-3 py-2 bg-white border border-yellow-300 rounded-md font-mono text-sm">
                        {demoCredentials.loginUrl}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center mb-4">
                    <button
                      onClick={copyCredentials}
                      className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={downloadCredentials}
                      className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download as File
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Share these credentials securely with John. He can use them to login immediately without any email verification.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-blue-800 mb-4 flex items-center justify-center">
                  <Users className="h-5 w-5 mr-2" />
                  What Happens Next?
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-blue-900">Share Credentials</p>
                      <p className="text-sm text-blue-700">Provide John with his login credentials securely</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-blue-900">Immediate Access</p>
                      <p className="text-sm text-blue-700">John can login and start working right away</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-blue-900">Role-Based Access</p>
                      <p className="text-sm text-blue-700">John has access to recruiter features based on his role</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDemoStep(3)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setDemoStep(1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Key Benefits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Key Benefits of Enhanced Team Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Immediate Productivity</h3>
              <p className="text-sm text-gray-600">
                New team members can start working immediately without waiting for email verification
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Automatic Role Assignment</h3>
              <p className="text-sm text-gray-600">
                Users are automatically assigned appropriate roles with predefined permissions
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Streamlined Onboarding</h3>
              <p className="text-sm text-gray-600">
                Managers can quickly add multiple team members with bulk invitation features
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Credential Management</h3>
              <p className="text-sm text-gray-600">
                Auto-generated secure passwords with easy sharing options for managers
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Company-Wide Control</h3>
              <p className="text-sm text-gray-600">
                Centralized management of all team members, roles, and permissions
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Audit & Compliance</h3>
              <p className="text-sm text-gray-600">
                Complete tracking of user creation, role changes, and system access
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="gradient-accent rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Streamline Your Team Management?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              The Enhanced Team Management System provides everything you need to efficiently onboard
              and manage your team members with professional-grade security and ease of use.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                Get Started
              </button>
              <button className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementDemo;
