import React, { useEffect, useState } from 'react';

import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useNavigate, useParams } from 'react-router-dom';
import { CLIENT_API_END_POINT, PROJECT_API_END_POINT } from '../utils/constant';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import useGetAllProjectsbyId from '../Hooks/useGetAllProjectById';
import Footer from '../shared/Footer';

const ProjectSetup = () => {
    const params = useParams();
    useGetAllProjectsbyId(params.id);
   
    const navigate = useNavigate();
    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null,
        client: "" // New field to store selected client
    });
    const { singleProject } = useSelector(store => store.project);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]); // State for storing all clients

    // Fetch all clients on component mount
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${CLIENT_API_END_POINT}/get`, { withCredentials: true });
                if (response.data.success) {
                    setClients(response.data.clients);
                } else {
                    toast.error("Failed to fetch clients.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error fetching clients.");
            }
        };

        fetchClients();
    }, []);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("website", input.website);
        formData.append("description", input.description);
        formData.append("location", input.location);
        formData.append("client", input.client); // Append selected client ID
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const res = await axios.put(`${PROJECT_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/projects");
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setInput({
            name: singleProject.name || "",
            description: singleProject.description || "",
            website: singleProject.website || "",
            location: singleProject.location || "",
            client: singleProject.client || "", // Set client ID if available
            file: singleProject.file || null
        });
    }, [singleProject]);

    return (
        <div>
            
            <div className='max-w-xl mx-auto my-10'>
                <form onSubmit={submitHandler}>
                    <div className='flex items-center gap-5 p-8'>
                        <Button 
                            variant="outline" 
                            className="flex items-center gap-2 text-gray-500 font-semibold" 
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft />
                            <span>Back</span>
                        </Button>
                        <h1 className='font-bold text-xl'>Project Setup</h1>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        {/* Client Selection */}
                        <div>
                            <Label>Client</Label>
                            <select 
                                name="client" 
                                value={input.client} 
                                onChange={changeEventHandler} 
                                className="border rounded-md p-2 w-full"
                                required
                            >
                                <option value="">Select a Client</option>
                                {clients.map((client) => (
                                    <option key={client._id} value={client._id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Project Name</Label>
                            <Input
                                type="text"
                                name="name"
                                value={input.name}
                                onChange={changeEventHandler}
                                required
                            />
                        </div>

                        <div>
                            <Label>Website</Label>
                            <Input
                                type="text"
                                name="website"
                                value={input.website}
                                onChange={changeEventHandler}
                                required
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                required
                            />
                        </div>

                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                required
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <Label>Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={changeFileHandler}
                            />
                        </div>
                    </div>

                    {
                        loading ? (
                            <Button className="w-full my-4" disabled>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please Wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4">Update</Button>
                        )
                    }
                </form>
            </div>
           
            
        </div>
    );
};

export default ProjectSetup;
