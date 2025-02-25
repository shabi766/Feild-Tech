import { useState } from 'react';
import Navbar from './components/shared/Navbar';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Home from './components/user/Home';
import Jobs from './components/user/Jobs';
import Browse from './components/user/Browse';
import Profile from './components/user/Profile';
import JobDescription from './components/user/JobDescription';
import Companies from './components/admin/companies';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';

import AdminJobs from './components/admin/AdminJobs';
import PostJobs from './components/admin/PostJobs';
import Applicants from './components/admin/Applicants';
import ProtectedRoute from './components/admin/ProtectedRoute';
import JobCalendar from './components/Schedueler/JobCalender';
import ClientSetup from './components/admin/ClientSetup';
import ClientsCreate from './components/admin/ClientsCreate';
import Clients from './components/admin/Clients';
import Projects from './components/admin/Projects';
import ProjectSetup from './components/admin/ProjectSetup';
import ProjectsCreate from './components/admin/ProjectsCreate';
import JobCalendarPage from './components/Schedueler/JobCalender';
 // Import ShowJob Component
import AllTechnicians from './components/admin/AllTechnicians';
import TalentPool from './components/admin/talentpool';
import ClientDetail from './components/admin/ClientDetail';
import ProjectDetail from './components/admin/ProjectDetail';

import TechnicianProfile from './components/admin/TechnicainProfile';
import ViewJob from './components/admin/ViewJob';
import ShowApplicantProfile from './components/admin/ShowApplicantProfile';
import ShowJob from './components/admin/ShowJob';
import AdminDashboard from './components/admin/AdminDashboard';
import Chat from './components/shared/Chat/chat';
import ChatProvider from './components/shared/Chat/chat';


const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/Login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/jobs',
    element: <Jobs />
  },
  {
    path: "/description/:id",
    element: <JobDescription />
  },
  {
    path: '/Browse',
    element: <Browse />
  },
  {
    path: '/Profile',
    element: <Profile />
  },
  {
    path: '/calender',
    element: <JobCalendar />
  },

  // Recruiter Routes (Protected)
  {
    path: "/dashboard",
    element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> 
  },
  {
    path: "/technicains/techs",
    element: <ProtectedRoute><AllTechnicians /></ProtectedRoute> 
  },
  {
    path : "/technicians/:id",
    element : <ProtectedRoute><TechnicianProfile/></ProtectedRoute>
  },
  {
    path : "/chat",
    element : <Chat/>
  },
  {
    path: "/admin/companies",
    element: <ProtectedRoute><Companies /></ProtectedRoute>
  },

  {
    path: "/admin/companies/:id",
    element: <ProtectedRoute><CompanySetup /></ProtectedRoute>
  },
  {
    path: "/admin/project/detail/:projectId",
    element: <ProtectedRoute><ProjectDetail /></ProtectedRoute>
  },

  {
    path: "/admin/client/details/:clientId",
    element: <ProtectedRoute><ClientDetail /></ProtectedRoute>
  },
  {
    path: "/admin/talentpool",
    element: <ProtectedRoute><TalentPool /></ProtectedRoute>

  },
  {
    path: "/admin/companies/create",
    element: <ProtectedRoute><CompanyCreate /></ProtectedRoute>
  },
  {
    path: "/admin/clients",
    element: <ProtectedRoute><Clients /></ProtectedRoute>
  },
  {
    path: "/admin/clients/:id",
    element: <ProtectedRoute><ClientSetup /></ProtectedRoute>
  },
  {
    path: "/admin/clients/create",
    element: <ProtectedRoute><ClientsCreate /></ProtectedRoute>
  },
  {
    path: "/admin/projects",
    element: <ProtectedRoute><Projects /></ProtectedRoute>
  },
  {
    path: "/admin/projects/:id",
    element: <ProtectedRoute><ProjectSetup /></ProtectedRoute>
  },
  {
    path: "/admin/Projects/create",
    element: <ProtectedRoute><ProjectsCreate /></ProtectedRoute>
  },
  {
    path: "/admin/jobs",
    element: <ProtectedRoute><AdminJobs /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/create",
    element: <ProtectedRoute><PostJobs /></ProtectedRoute>
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: <ProtectedRoute><Applicants /></ProtectedRoute>
  },
  {
    path: "/viewjob/:id",
    element: <ProtectedRoute><ViewJob /></ProtectedRoute>
  },
  {
    path: "/applicantprofile/:id",
    element: <ProtectedRoute><ShowApplicantProfile /></ProtectedRoute>
  },
  {
    path: "admin/jobs/:id",
    element: <ProtectedRoute><ShowJob /></ProtectedRoute>
  },

  
  {
    path: "/JobCalender",
    element: <ProtectedRoute><JobCalendarPage /></ProtectedRoute>
  },
]);
const useJwtExpirationChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken'); // or wherever your token is stored
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert current time to seconds

      if (decodedToken.exp < currentTime) {
        // Token is expired, log out user
        localStorage.removeItem('userToken');
        navigate('/login'); // Redirect to login page
      }
    }
  }, [navigate]);
};


function App() {
  return (
   
   <div>
      <RouterProvider router={appRouter} />
    </div>
  );
}

export default App;
