import { setAllAppliedJobs } from "@/redux/jobSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector
import { APPLICATION_API_END_POINT } from "../utils/constant";

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchAppliedJobs = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, { withCredentials: true, signal });

                if (res.data.success) {
                    dispatch(setAllAppliedJobs(res.data.application));
                } else {
                    const errorMessage = res.data.message || "Failed to fetch applied jobs.";
                    console.error("Failed to fetch applied jobs:", errorMessage);
                    setError(errorMessage);
                    dispatch(setAllAppliedJobs([])); // Clear applied jobs on error
                }
            } catch (err) {
                if (err.name !== 'CanceledError') { // Check if the error was due to abort
                    const errorMessage = err.message || 'An error occurred while fetching applied jobs';
                    console.error("Error fetching applied jobs:", errorMessage, err); // Log full error
                    setError(errorMessage);
                    dispatch(setAllAppliedJobs([])); // Clear applied jobs on error
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAppliedJobs();

        return () => {
            controller.abort(); // Cleanup function to cancel the fetch request
        };
    }, [dispatch]); // dispatch is a dependency

    return { 
        appliedJobs: useSelector(state => state.job.appliedJobs), // Access applied jobs from Redux
        loading, 
        error 
    };
};

export default useGetAppliedJobs;