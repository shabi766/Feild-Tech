import { useEffect, useState } from 'react'; // Import useState
import { useDispatch, useSelector } from 'react-redux';
import { PROJECT_API_END_POINT } from '../utils/constant';
import axios from 'axios';
import { setProjects } from '@/redux/projectSlice';

const useGetAllProjects = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null);   // Add error state

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true); // Set loading to true before fetching
            setError(null);   // Clear any previous errors

            try {
                const res = await axios.get(`${PROJECT_API_END_POINT}/get`, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setProjects(res.data.projects));
                } else {
                    const errorMessage = res.data.message || "Failed to fetch projects.";
                    console.error("Failed to fetch projects:", errorMessage);
                    // Optional: Dispatch an error action
                    // dispatch(setProjectsError(errorMessage));
                    setError(errorMessage);
                    dispatch(setProjects([])); // Clear on error
                }
            } catch (error) {
                console.error("Error fetching projects:", error); // Log the full error object
                // Optional: Dispatch an error action
                // dispatch(setProjectsError("A network error occurred."));
                setError("A network error occurred.");
                dispatch(setProjects([])); // Clear on error
            } finally {
                setLoading(false); // Set loading to false after fetch (success or error)
            }
        };

        fetchProjects();
    }, [dispatch]); // dispatch is a dependency

    return { projects: useSelector(state => state.project.projects), loading, error }; // Return projects, loading, and error. Access projects from your redux store. Make sure you have a selector to access the projects.
};

export default useGetAllProjects;