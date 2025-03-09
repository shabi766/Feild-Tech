import React, { useState, useEffect } from 'react';

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { PROJECT_API_END_POINT, CLIENT_API_END_POINT, NOTIFICATION_API_END_POINT } from '../utils/constant';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setSingleProject } from '@/redux/projectSlice';
import Footer from '../shared/Footer';

const ProjectsCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State for form fields
  const [input, setInput] = useState({
    name: '',
    website: '',
    description: '',
    location: '',
    client: '', 
  });

  const [clients, setClients] = useState([]); 
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${CLIENT_API_END_POINT}/get`, { withCredentials: true });
        if (res.data.success) {
          setClients(res.data.clients);
        } else {
          toast.error("Failed to load clients.");
        }
      } catch (error) {
        toast.error("Error fetching clients. Please try again later.");
      }
    };
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const registerNewProject = async () => {
    const { name, website, description, location, client } = input;
    if (!name.trim() || !client.trim()) {
      toast.error("Project name and client are required.");
      return;
    }

    setLoading(true); 

    try {
      const res = await axios.post(
        `${PROJECT_API_END_POINT}/register`,
        {
          projectName: name.trim(),
          website: website.trim(),
          description: description.trim(),
          location: location.trim(),
          clientId: client.trim(), 
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      if (res.data.success) {
        dispatch(setSingleProject(res.data.project));
        toast.success("Project created successfully!");
        const notificationMessage = `Project ${res.data.project.name} was created successfully.`;
                await axios.post(`${NOTIFICATION_API_END_POINT}/Project-create`, {
                    message: notificationMessage,
                    userId: res.data.project._id,
                }, { withCredentials: true }); 

                navigate(`/admin/projects`);
        const projectId = res.data.project._id;

        
        await sendProjectCreatedNotification(projectId); 
        navigate(`/admin/projects`);
      } else {
        toast.error(res.data.message || "Failed to create project.");
      }
    } catch (error) {
      console.error("API error:", error.response || error);
      toast.error(error.response?.data?.message || "An error occurred while creating the project.");
    } finally {
      setLoading(false); 
    }
  };

  const sendProjectCreatedNotification = async (projectId) => {
    try {
      const res = await axios.post(
        `${PROJECT_API_END_POINT}/notify-assigned-user`,
        { projectId },
        { withCredentials: true }
      );
  
      if (!res.data.success) {
        console.warn("Failed to send project creation notification:", res.data.message);
      }
    } catch (error) {
      console.error("Error sending project creation notification:", error);
    }
  };
  return (
    <div>
      
      <div className='max-w-4xl mx-auto'>
        <div className='my-10'>
          <h1 className='font-bold text-2xl'>Create New Project</h1>
          <p className='text-gray-500'>Please fill out the details below to create a new project.</p>
                </div>

                {/* Project Name */}
                <Label>Project Name</Label>
                <Input
                    type="text"
                    className="my-2"
                    placeholder="Project name (e.g., JobHunt, Microsoft)"
                    name="name"
                    value={input.name}
                    onChange={handleChange}
                    required
                />

                {/* Client Dropdown */}
                <Label>Select Client</Label>
                <select
                    name="client"
                    value={input.client}
                    onChange={handleChange}
                    className="my-2 border rounded-md p-2 w-full"
                    required
                >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                            {client.name}
                        </option>
                    ))}
                </select>

                {/* Website */}
                <Label>Website</Label>
                <Input
                    type="text"
                    className="my-2"
                    placeholder="Website URL"
                    name="website"
                    value={input.website}
                    onChange={handleChange}
                />

                {/* Description */}
                <Label>Description</Label>
                <Input
                    type="text"
                    className="my-2"
                    placeholder="Project description"
                    name="description"
                    value={input.description}
                    onChange={handleChange}
                />

                {/* Location */}
                <Label>Location</Label>
                <Input
                    type="text"
                    className="my-2"
                    placeholder="Project location"
                    name="location"
                    value={input.location}
                    onChange={handleChange}
                />

                {/* Submit Button */}
                <div className='flex items-center gap-2 my-10'>
                    <Button variant="outline" onClick={() => navigate("/admin/projects")}>Cancel</Button>
                    <Button onClick={registerNewProject} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </div>
           
            
        </div>
    );
};

export default ProjectsCreate;
