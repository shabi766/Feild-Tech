import { PROJECT_API_END_POINT } from '@/components/utils/constant';
import axios from 'axios';
import { useEffect, useState } from 'react'; // Import useState
import { useDispatch, useSelector } from 'react-redux';
import { setSingleProject } from '@/redux/projectSlice';

const useGetProjectById = (projectId) => { // More descriptive name
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null);   // Add error state

    useEffect(() => {
        const fetchProject = async () => { // More descriptive name
            if (!projectId) {
                dispatch(setSingleProject(null));
                setLoading(false); // Important: Set loading to false if projectId is nullish
                return;
            }

            setLoading(true); // Set loading to true before fetching
            setError(null);   // Clear any previous errors

            try {
                const res = await axios.get(`${PROJECT_API_END_POINT}/get/${projectId}`, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setSingleProject(res.data.project));
                } else {
                    const errorMessage = res.data.message || "Failed to fetch project.";
                    console.error("Failed to fetch project:", errorMessage);
                    // Optional: Dispatch error action
                     dispatch(setProjectError(errorMessage));
                    setError(errorMessage);
                    dispatch(setSingleProject(null)); // Clear on error
                }
            } catch (error) {
                console.error("Error fetching project:", error); // Log full error object
                // Optional: Dispatch error action
                 dispatch(setProjectError("A network error occurred."));
                setError("A network error occurred.");
                dispatch(setSingleProject(null)); // Clear on error
            } finally {
                setLoading(false); // Set loading to false after fetch (success or error)
            }
        };

        if (projectId) {
            fetchProject();
        } else {
            dispatch(setSingleProject(null)); // Clear if initially nullish
            setLoading(false); // Also set loading to false if no projectId to fetch
        }
    }, [projectId, dispatch]); // dispatch is a dependency

    return { project: useSelector(state => state.project.singleProject), loading, error }; // Return project, loading, and error
};

export default useGetProjectById; // Consistent naming