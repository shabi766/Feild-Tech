import { useEffect, useState } from 'react';
import axios from 'axios';
import { PROJECT_API_END_POINT, JOB_API_END_POINT } from '../utils/constant';

const useProjectDetails = (projectId) => {
    const [project, setProject] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const projectRes = await axios.get(`${PROJECT_API_END_POINT}/get/${projectId}`, { withCredentials: true });

                if (projectRes.data.success && projectRes.data.project) { // Check for success and data
                    setProject(projectRes.data.project);

                    const jobsRes = await axios.get(`${JOB_API_END_POINT}/get-by-project/${projectId}`, { withCredentials: true });

                    if (jobsRes.data.success) { // Check for success before setting jobs
                        setJobs(jobsRes.data.jobs || []); // Handle empty jobs array
                    } else {
                        const jobsErrorMessage = jobsRes.data.message || "Failed to fetch jobs.";
                        console.error("Failed to fetch jobs:", jobsErrorMessage);
                        // Consider setting a separate jobs error if needed:
                        // setJobsError(jobsErrorMessage);
                        setJobs([]); // Clear jobs on error.
                    }
                } else {
                    const projectErrorMessage = projectRes.data.message || "Failed to fetch project.";
                    console.error("Failed to fetch project:", projectErrorMessage);
                    setError(projectErrorMessage); // Set the main error
                    setProject(null); // Clear project on error
                }
            } catch (err) {
                const errorMessage = err.message || "An error occurred while fetching project details.";
                console.error("Error fetching project details:", errorMessage, err); // Log full error
                setError(errorMessage); // Set the error
                setProject(null); // Clear project on error
                setJobs([]);     // Clear jobs on error
            } finally {
                setLoading(false);
            }
        };

        if (projectId) { // Only fetch if projectId is valid
            fetchProjectDetails();
        } else {
            setLoading(false); // If no projectId, not loading
            setProject(null); // Clear project if no ID
            setJobs([]); // Clear Jobs if no ID
        }
    }, [projectId]);

    return { project, jobs, loading, error };
};

export default useProjectDetails;