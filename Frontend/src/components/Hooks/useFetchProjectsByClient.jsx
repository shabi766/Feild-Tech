import { useState, useEffect } from 'react';
import axios from 'axios';
import { PROJECT_API_END_POINT } from '../utils/constant';

export const useFetchProjectsByClient = (clientId) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!clientId) {
                setProjects([]); // Clear projects if clientId is nullish
                return; // Exit early if no clientId
            }

            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${PROJECT_API_END_POINT}/get-by-client/${clientId}`, { withCredentials: true });
                if (response.data.success) {
                    setProjects(response.data.projects);
                } else {
                    setProjects([]);
                    setError(response.data.message || 'Failed to fetch projects.'); // Set error message from server if available
                }
            } catch (err) {
                console.error("Error fetching projects:", err); // Log the full error for debugging
                setError('Failed to fetch projects. Please check the console for details.'); // More generic user-facing error
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [clientId]);

    return { projects, loading, error };
};