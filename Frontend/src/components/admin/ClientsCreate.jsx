import React, { useEffect, useState } from 'react';

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { CLIENT_API_END_POINT, NOTIFICATION_API_END_POINT } from '../utils/constant';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setSingleClient } from '@/redux/clientSlice';
import Footer from '../shared/Footer';
import socket from '../shared/socket';

const ClientsCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [input, setInput] = useState({
        name: '',
        website: '',
        description: '',
        location: '',
        file: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Add error state

    useEffect(() => {
        socket.on('connect', () => {
            console.log('ClientsCreate: Socket connected!');
        });

        socket.on('disconnect', () => {
            console.log('ClientsCreate: Socket disconnected!');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    const handleChange = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
        setError(null); // Clear error when input changes
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
        setError(null); // Clear error when file changes
    };

    const registerNewClient = async () => {
        const { name, website, description, location, file } = input;

        if (!name.trim()) {
            setError("Client name cannot be empty"); // Set error state
            return;
        }

        const formData = new FormData();
        formData.append("clientName", name);
        formData.append("website", website);
        formData.append("description", description);
        formData.append("location", location);
        if (file) {
            formData.append("file", file);
        }

        setLoading(true);
        setError(null); // Clear any previous errors

        try {
            const res = await axios.post(`${CLIENT_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (res.data.success) {
                dispatch(setSingleClient(res.data.client));
                toast.success(res.data.message);

                const notificationMessage = `Client ${res.data.client.name} was created successfully.`;
                await axios.post(`${NOTIFICATION_API_END_POINT}/client-create`, {
                    message: notificationMessage,
                    userId: res.data.client._id,
                }, { withCredentials: true }); 

                navigate(`/admin/clients`);
            } else {
                const errorMessage = res.data.message || "Failed to create client.";
                console.error("Failed to create client:", errorMessage);
                setError(errorMessage); // Set error state
                toast.error(errorMessage); // Show error toast
                if (res.data.error && res.data.error.errors) {
                    Object.keys(res.data.error.errors).forEach(key => {
                        const errorMsg = res.data.error.errors[key].message;
                        toast.error(errorMsg); // Display individual field errors
                        console.error("Validation Error:", errorMsg)
                    });}
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "An error occurred while creating the client.";
            console.error("Error creating client:", errorMessage, error); // Log full error object
            setError(errorMessage); // Set error state
            toast.error(errorMessage); // Show error toast

            if(error.response?.data?.error?.name === "ValidationError"){
                Object.keys(error.response?.data?.error.errors).forEach(key => {
                    const errorMsg = error.response?.data?.error.errors[key].message;
                    toast.error(errorMsg);
                    console.error("Mongoose Validation Error:", errorMsg)
                })
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            
            <div className='max-w-4xl mx-auto'>
                <div className='my-10'>
                    <h1 className='font-bold text-2xl'>Create New Client</h1>
                    <p className='text-gray-500'>Fill out the details below to register a new client.</p>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>} {/* Display error message */}

                <Label>Client Name</Label>
                <Input
                    type="text"
                    className="my-2"
                    placeholder="JobHunt, Microsoft, etc."
                    name="name"
                    value={input.name}
                    onChange={handleChange}
                    required
                />
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
                    placeholder="Client description"
                    name="description"
                    value={input.description}
                    onChange={handleChange}
                />

                {/* Location */}
                <Label>Location</Label>
                <Input
                    type="text"
                    className="my-2"
                    placeholder="Client location"
                    name="location"
                    value={input.location}
                    onChange={handleChange}
                />

                {/* Logo Upload */}
                <Label>Logo (optional)</Label>
                <Input
                    type="file"
                    accept="image/*"
                    className="my-2"
                    onChange={handleFileChange}
                />

                {/* Submit Button */}
                <div className='flex items-center gap-2 my-10'>
                    <Button variant="outline" onClick={() => navigate("/admin/clients")}>Cancel</Button>
                    <Button onClick={registerNewClient} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Client'}
                    </Button>
                </div>
            </div>
           
            
        </div>
    );
};

export default ClientsCreate;
