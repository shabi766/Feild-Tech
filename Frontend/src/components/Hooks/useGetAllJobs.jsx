import { setAllJobs } from '@/redux/jobSlice';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { JOB_API_END_POINT } from '../utils/constant';

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector((store) => store.job);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`, { withCredentials: true });

                if (res.data.success) {
                    setJobs(res.data.jobs);
                    dispatch(setAllJobs(res.data.jobs));
                } else {
                    const errorMessage = res.data.message || "Failed to fetch jobs.";
                    console.error("Failed to fetch jobs:", errorMessage);
                    setError(errorMessage);
                    dispatch(setAllJobs([])); // Clear in Redux
                    setJobs([]); // Clear locally
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setError("A network error occurred.");  // Or a more specific message if available
                dispatch(setAllJobs([]));
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        if (searchedQuery || !searchedQuery) {  // Fetch if there's a query OR if you want initial fetch
            fetchJobs();
        } else {
            setLoading(false);
            dispatch(setAllJobs([]));
            setJobs([]);
        }

    }, [searchedQuery, dispatch]);

    return { jobs, loading, error };
};

export default useGetAllJobs;