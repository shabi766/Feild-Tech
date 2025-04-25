// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Home from "./components/user/Home";
import Jobs from "./components/user/Jobs";
import Browse from "./components/user/Browse";
import Profile from "./components/user/Profile";
import JobDescription from "./components/user/JobDescription";

import CompanyCreate from "./components/admin/CompanyCreate";
import CompanySetup from "./components/admin/CompanySetup";
import AdminJobs from "./components/admin/AdminJobs";

import Applicants from "./components/admin/Applicants";
import JobCalendar from "./components/Schedueler/JobCalender";
import ClientSetup from "./components/admin/ClientSetup";
import ClientsCreate from "./components/admin/ClientsCreate";
import Clients from "./components/admin/Clients";
import Projects from "./components/admin/Projects";
import ProjectSetup from "./components/admin/ProjectSetup";
import ProjectsCreate from "./components/admin/ProjectsCreate";
import JobCalendarPage from "./components/Schedueler/JobCalender";
import AllTechnicians from "./components/admin/AllTechnicians";
import TalentPool from "./components/admin/talentpool";
import ClientDetail from "./components/admin/ClientDetail";
import ProjectDetail from "./components/admin/ProjectDetail";

import ShowApplicantProfile from "./components/admin/ShowApplicantProfile";
import ShowJob from "./components/admin/ShowJob";
import AdminDashboard from "./components/admin/AdminDashboard";
import Chat from "./components/shared/Chat/chat";
import { ChatProvider } from "./context/ChatContext";
import TechnicianProfile from "./components/admin/TechnicainProfile";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import Layout from "../Layout"; // Import Layout
import Settings from "./components/shared/Settings";
import JobTable from "./components/user/JobTable";
import PostJobs from "./components/admin/PostJobcomps/PostJob";

import Companies from "./components/admin/Companies";
import ViewJob from "./components/admin/ViewJobs/ViewJob";

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="description/:id" element={<JobDescription />} />
            <Route path="browse" element={<Browse />} />
            <Route path="profile" element={<Profile />} />
            <Route path="calender" element={<JobCalendar />} />
            <Route path="chat" element={<Chat />} />
            <Route path="/settings" element={<Settings/>} />
            <Route path="/Myjobs" element={<JobTable/>} />
            <Route path="technicians/techs" element={<ProtectedRoute><AllTechnicians /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="technicians/:id" element={<ProtectedRoute><TechnicianProfile /></ProtectedRoute>} />
            <Route path="admin/companies" element={<ProtectedRoute>< Companies /></ProtectedRoute>} />
            <Route path="admin/companies/:id" element={<ProtectedRoute><CompanySetup /></ProtectedRoute>} />
            <Route path="admin/project/detail/:projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="admin/client/details/:clientId" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
            <Route path="admin/talentpool" element={<ProtectedRoute><TalentPool /></ProtectedRoute>} />
            <Route path="admin/companies/create" element={<ProtectedRoute><CompanyCreate /></ProtectedRoute>} />
            <Route path="admin/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="admin/clients/:id" element={<ProtectedRoute><ClientSetup /></ProtectedRoute>} />
            <Route path="admin/clients/create" element={<ProtectedRoute><ClientsCreate /></ProtectedRoute>} />
            <Route path="admin/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="admin/projects/:id" element={<ProtectedRoute><ProjectSetup /></ProtectedRoute>} />
            <Route path="admin/projects/create" element={<ProtectedRoute><ProjectsCreate /></ProtectedRoute>} />
            <Route path="admin/jobs" element={<ProtectedRoute><AdminJobs /></ProtectedRoute>} />
            <Route path="admin/jobs/create" element={<ProtectedRoute><PostJobs /></ProtectedRoute>} />
            <Route path="admin/jobs/:id/applicants" element={<ProtectedRoute><Applicants /></ProtectedRoute>} />
            <Route path="viewjob/:id" element={<ProtectedRoute><ViewJob /></ProtectedRoute>} />
            <Route path="applicantprofile/:id" element={<ProtectedRoute><ShowApplicantProfile /></ProtectedRoute>} />
            <Route path="admin/jobs/:id" element={<ProtectedRoute><ShowJob /></ProtectedRoute>} />
            <Route path="jobcalender" element={<ProtectedRoute><JobCalendarPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;