// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import AdminLogin from "./components/Auth/AdminLogin";
import RoleSelection from "./components/Auth/RoleSelection";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ProfileSetup from "./components/Auth/ProfileSetup";
import Home from "./components/user/Home";
import Jobs from "./components/user/Jobs";
import Browse from "./components/user/Browse";
import Profile from "./components/user/Profile";
import JobDescription from "./components/user/JobDescription";

import CompanyCreate from "./components/admin/CompanyCreate";
import CompanySetup from "./components/admin/CompanySetup";
import CompanyRegistration from "./components/Auth/CompanyRegistration";

import AdminJobs from "./components/admin/AdminJobs";
import Teams from "./components/admin/Teams";
import Templates from "./components/admin/Templates";

import Applicants from "./components/admin/Applicants";
import EnhancedJobCalendar from "./components/Schedueler/EnhancedJobCalendar";
import ClientSetup from "./components/admin/ClientSetup";
import ClientsCreate from "./components/admin/ClientsCreate";
import Clients from "./components/admin/Clients";
import Projects from "./components/admin/Projects";
import ProjectSetup from "./components/admin/ProjectSetup";
import ProjectsCreate from "./components/admin/ProjectsCreate";

import AllTechnicians from "./components/admin/AllTechnicians";
import TalentPool from "./components/admin/talentpool";
import ClientDetail from "./components/admin/ClientDetail";
import ProjectDetail from "./components/admin/ProjectDetail";

import ShowApplicantProfile from "./components/admin/ShowApplicantProfile";
import ShowJob from "./components/admin/ShowJob";
import AdminDashboard from "./components/admin/AdminDashboard";
import CompanyRecruiterDashboard from "./components/recruiter/CompanyRecruiterDashboard";
import TeamManagement from "./components/recruiter/TeamManagement";
import TeamDetails from "./components/recruiter/TeamDetails";
import RoleDetails from "./components/recruiter/RoleDetails";
import Chat from "./components/shared/Chat/chat";
import { ChatProvider } from "./context/ChatContext";
import { UserProvider } from "./context/UserContext";
import TechnicianProfile from "./components/shared/TechnicianProfile";
import Leaderboard from "./components/shared/Leaderboard";
import TechnicianLeaderboard from "./components/user/TechnicianLeaderboard";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Layout from "../Layout"; // Import Layout
import { MainSettings } from "./components/shared/Settings";
import { SettingsProvider } from "./context/SettingsContext";
import { LanguageProvider } from "./context/LanguageContext";
import JobTable from "./components/user/JobTable";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import PostJobs from "./components/admin/PostJobcomps/PostJob";
import SimplePostJob from "./components/recruiter/SimplePostJob";
import IndividualRecruiterDashboard from "./components/recruiter/IndividualRecruiterDashboard";
import Wallets from "./components/wallet/Wallets";

import Companies from "./components/admin/Companies";
import ViewJob from "./components/admin/ViewJobs/ViewJob";
import LandingPage from "./components/LandingPage/LandingPage";
import AdministratorPanel from "./components/administrator/AdministratorPanel";

// Import new info pages
import FindTech from "./components/LandingPage/info/FindTech";
import FindWork from "./components/LandingPage/info/FindWork";
import ServiceCoverage from "./components/LandingPage/info/ServiceCoverage";
import Resources from "./components/LandingPage/info/Resources";
import About from "./components/LandingPage/info/About";
import UpdateProfilePage from "./components/user/UpdateProfilePage";
import { usePageTracking } from "./hooks/usePageTracking";

const PageTracker = () => {
  usePageTracking();
  return null;
};

// Initialize Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

// Component to handle role-based redirects
const RoleBasedRedirect = () => {
  const { user, loading } = useSelector(store => store.auth);

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const role = user.role?.toLowerCase();

  if (role === 'admin') {
    return <Navigate to="/app/administrator" replace />;
  } else if (role === 'company') {
    // Company recruiter (backend returns role: "Company")
    console.log('RoleBasedRedirect - Redirecting to company dashboard');
    return <Navigate to="/app/recruiter/dashboard" replace />;
  } else if (role === 'recruiter') {
    // Individual recruiter or check recruiterType
    console.log('RoleBasedRedirect - User recruiterType:', user.recruiterType);
    console.log('RoleBasedRedirect - User companyId:', user.companyId);
    if (user.recruiterType === 'Company') {
      console.log('RoleBasedRedirect - Redirecting to company dashboard (via recruiterType)');
      return <Navigate to="/app/recruiter/dashboard" replace />;
    } else {
      console.log('RoleBasedRedirect - Redirecting to individual dashboard');
      return <Navigate to="/app/recruiter/dashboard-individual" replace />;
    }
  } else if (role === 'technician') {
    return <Navigate to="/app/technician/home" replace />;
  }

  // Default fallback
  return <Navigate to="/app/technician/home" replace />;
};

// Component to handle authenticated landing with profile setup check
const AuthenticatedLanding = () => {
  const { user, loading } = useSelector(store => store.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Check if user needs to complete profile setup
  if (!user.profileCompleted && (!user.profile || !user.profile.bio || !user.profile.skills || user.profile.skills.length === 0)) {
    return <Navigate to="/app/profile-setup" replace />;
  }

  // Redirect based on user role
  const role = user.role?.toLowerCase();

  if (role === 'admin') {
    return <Navigate to="/app/administrator" replace />;
  } else if (role === 'company') {
    // Company recruiter (backend returns role: "Company")
    console.log('AuthenticatedLanding - Redirecting to company dashboard');
    return <Navigate to="/app/recruiter/dashboard" replace />;
  } else if (role === 'recruiter') {
    // Individual recruiter or check recruiterType
    console.log('AuthenticatedLanding - User recruiterType:', user.recruiterType);
    console.log('AuthenticatedLanding - User companyId:', user.companyId);
    if (user.recruiterType === 'Company') {
      console.log('AuthenticatedLanding - Redirecting to company dashboard (via recruiterType)');
      return <Navigate to="/app/recruiter/dashboard" replace />;
    } else {
      console.log('AuthenticatedLanding - Redirecting to individual dashboard');
      return <Navigate to="/app/recruiter/dashboard-individual" replace />;
    }
  } else if (role === 'technician') {
    return <Navigate to="/app/technician/home" replace />;
  }

  return <LandingPage />;
};

function App() {
  return (
    <BrowserRouter>
      <PageTracker />
      <ErrorBoundary>
        <UserProvider>
          <ChatProvider>
            <SettingsProvider>
              <LanguageProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<AuthenticatedLanding />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/role-selection" element={<RoleSelection />} />
                  <Route path="/company-registration" element={<CompanyRegistration />} />

                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/admin-login" element={<AdminLogin />} />

                  {/* Info pages routes */}
                  <Route path="/find-tech" element={<FindTech />} />
                  <Route path="/find-work" element={<FindWork />} />
                  <Route path="/service-coverage" element={<ServiceCoverage />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/about" element={<About />} />

                  {/* Protected routes with Layout */}
                  <Route path="/app" element={<Layout />}>

                    {/* Profile Setup Route - accessible to all authenticated users */}
                    <Route path="profile-setup" element={<ProtectedRoute />}>
                      <Route index element={<ProfileSetup />} />
                    </Route>

                    {/* Recruiter Routes */}
                    <Route path="recruiter" element={<ProtectedRoute requiredRole="Recruiter" />}>
                      <Route path="dashboard" element={<CompanyRecruiterDashboard />} />
                      <Route path="dashboard-individual" element={<IndividualRecruiterDashboard />} />
                      <Route path="technicians/techs" element={<AllTechnicians />} />
                      <Route path="technicians/:id" element={<TechnicianProfile />} />
                      <Route path="leaderboard" element={<Leaderboard />} />
                      <Route path="jobs" element={<AdminJobs />} />
                      <Route path="jobs/create" element={<PostJobs />} />
                      <Route path="jobs/create-simple" element={<SimplePostJob />} />
                      <Route path="jobs/:id/applicants" element={<Applicants />} />
                      <Route path="viewjob/:id" element={<ViewJob />} />
                      <Route path="applicantprofile/:id" element={<ShowApplicantProfile />} />
                      <Route path="jobs/:id" element={<ShowJob />} />
                      <Route path="job-calendar" element={<EnhancedJobCalendar />} />
                      <Route path="chat" element={<Chat />} />
                      <Route path="settings" element={<MainSettings />} />
                      <Route path="wallets" element={<Wallets />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="profile/update" element={<UpdateProfilePage />} />

                      {/* Individual recruiter specific routes */}
                      <Route path="applicants" element={<Applicants />} />
                      <Route path="talentpool" element={<TalentPool />} />

                      {/* Company-specific routes - only accessible to company recruiters */}
                      <Route path="companies" element={<Companies />} />
                      <Route path="companies/:id" element={<CompanySetup />} />
                      <Route path="companies/create" element={<CompanyCreate />} />
                      <Route path="clients" element={<Clients />} />
                      <Route path="clients/:id" element={<ClientSetup />} />
                      <Route path="clients/create" element={<ClientsCreate />} />
                      <Route path="projects" element={<Projects />} />
                      <Route path="projects/:id" element={<ProjectSetup />} />
                      <Route path="projects/create" element={<ProjectsCreate />} />
                      <Route path="project/detail/:projectId" element={<ProjectDetail />} />
                      <Route path="client/details/:clientId" element={<ClientDetail />} />
                      <Route path="teams" element={<Teams />} />
                      <Route path="templates" element={<Templates />} />
                      <Route path="team-management" element={<TeamManagement />} />
                      <Route path="team-management/:teamId" element={<TeamDetails />} />
                      <Route path="role-management/:roleId" element={<RoleDetails />} />
                    </Route>

                    {/* Technician Routes */}
                    <Route path="technician" element={<ProtectedRoute requiredRole="Technician" />}>
                      <Route path="home" element={<Home />} />
                      <Route path="jobs" element={<Jobs />} />
                      <Route path="description/:id" element={<JobDescription />} />
                      <Route path="browse" element={<Browse />} />
                      <Route path="profile" element={<TechnicianProfile />} />
                      <Route path="profile/update" element={<UpdateProfilePage />} />
                      <Route path="calendar" element={<EnhancedJobCalendar />} />
                      <Route path="chat" element={<Chat />} />
                      <Route path="leaderboard" element={<TechnicianLeaderboard />} />
                      <Route path="settings" element={<MainSettings />} />
                      <Route path="wallets" element={<Wallets />} />
                      <Route path="my-jobs" element={<JobTable />} />
                    </Route>

                    {/* Administrator Routes */}
                    <Route path="administrator" element={<ProtectedRoute requiredRole="Admin" />}>
                      <Route index element={<AdministratorPanel />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="profile/update" element={<UpdateProfilePage />} />
                      <Route path="settings" element={<MainSettings />} />
                    </Route>

                    {/* Legacy routes - redirect to appropriate role-based routes */}
                    <Route path="dashboard" element={<Navigate to="/app/recruiter/dashboard" replace />} />
                    <Route path="home" element={<Navigate to="/app/technician/home" replace />} />
                    <Route path="jobs" element={<Navigate to="/app/technician/jobs" replace />} />
                    <Route path="description/:id" element={<Navigate to="/app/technician/description/:id" replace />} />
                    <Route path="browse" element={<Navigate to="/app/technician/browse" replace />} />
                    <Route path="profile" element={<Navigate to="/app/technician/profile" replace />} />
                    <Route path="profile/update" element={<Navigate to="/app/technician/profile/update" replace />} />
                    <Route path="calendar" element={<Navigate to="/app/technician/calendar" replace />} />
                    <Route path="chat" element={<Navigate to="/app/recruiter/chat" replace />} />
                    <Route path="settings" element={<Navigate to="/app/recruiter/settings" replace />} />
                    <Route path="wallets" element={<Navigate to="/app/recruiter/wallets" replace />} />
                    <Route path="my-jobs" element={<Navigate to="/app/technician/my-jobs" replace />} />
                  </Route>

                  {/* Catch all route - redirect to role-based page */}
                  <Route path="*" element={<RoleBasedRedirect />} />
                </Routes>
              </LanguageProvider>
            </SettingsProvider>
          </ChatProvider>
        </UserProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;