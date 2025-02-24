import axios from 'axios';
import { useEffect } from 'react';
import { JOB_API_END_POINT } from '../utils/constant';
import { useDispatch } from 'react-redux';
import { setAllAdminJobs } from '@/redux/jobSlice';

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAllAdminJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setAllAdminJobs(res.data.jobs));
                } else {
                    console.error("Failed to fetch admin jobs:", res.data.message || "Unknown error"); // Log error message from server
                    // Optionally dispatch an action to set an error state in your Redux store
                     dispatch(setAdminJobsError(res.data.message || "Failed to fetch jobs"));
                }
            } catch (error) {
                console.error("Error fetching admin jobs:", error); // Log the full error object
                // Optionally dispatch an action to set an error state in your Redux store
                 dispatch(setAdminJobsError("A network error occurred."));
            }
        };

        fetchAllAdminJobs();
    }, [dispatch]); // Add dispatch to the dependency array

};

export default useGetAllAdminJobs;