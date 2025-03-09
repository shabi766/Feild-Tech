import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { CLIENT_API_END_POINT, PROJECT_API_END_POINT } from '../utils/constant';
import axios from 'axios';

import Footer from '../shared/Footer';

const ClientDetail = () => {
    const { clientId } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate
    const [client, setClient] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                const clientRes = await axios.get(`${CLIENT_API_END_POINT}/get/${clientId}`, { withCredentials: true });
                setClient(clientRes.data.client);

                const projectsRes = await axios.get(`${PROJECT_API_END_POINT}/get-by-client/${clientId}`, { withCredentials: true });
                setProjects(projectsRes.data.projects || []);
            } catch (error) {
                console.error("Error fetching client or projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClientDetails();
    }, [clientId]);

    if (loading) return <p className="text-center text-xl my-10">Loading client details...</p>;

    return (
        <div>
           
            <div className="container mx-auto my-10 bg-white p-8 shadow-lg rounded-lg">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Client Details</h1>

                {client ? (
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                        <div className="mb-6">
                            <h2 className="text-3xl font-semibold text-blue-600 mb-2">{client.name}</h2>
                            <p className="text-gray-700 mb-2"><strong>Description:</strong> {client.description || 'No description available.'}</p>
                            <p className="text-gray-700 mb-2"><strong>Location:</strong> {client.location || 'No location provided.'}</p>
                            {client.website && (
                                <p className="text-gray-700 mb-2">
                                    <strong>Website:</strong>{" "}
                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700">
                                        {client.website}
                                    </a>
                                </p>
                            )}
                        </div>

                        {/* Display list of projects associated with this client */}
                        <div className="mt-8">
                            <h3 className="text-2xl font-semibold text-gray-800">Projects</h3>
                            {projects.length > 0 ? (
                                <ul className="mt-4 space-y-4">
                                    {projects.map((project) => (
                                        <li 
                                            key={project._id} 
                                            className="p-4 bg-white shadow-md rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" 
                                            onClick={() => navigate(`/admin/project/detail/${project._id}`)} // Navigate to project detail
                                        >
                                            <span className="text-lg font-bold text-blue-500">{project.name}</span>
                                            <p className="text-gray-600">{project.description || 'No description available.'}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 mt-4">No projects found for this client.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-red-500 text-xl">Client not found.</p>
                )}
            </div>
            
            
        </div>
    );
};

export default ClientDetail;