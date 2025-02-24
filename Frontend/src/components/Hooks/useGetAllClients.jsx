import { setClients } from '@/redux/clientSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CLIENT_API_END_POINT } from '../utils/constant';
import axios from 'axios';

const useGetAllClients = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await axios.get(`${CLIENT_API_END_POINT}/get`, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setClients(res.data.clients));
                } else {
                    console.error("Failed to fetch clients:", res.data.message || "Unknown error"); // Log server error
                    // Optional: Dispatch an error action for Redux if needed
                     dispatch(setClientsError(res.data.message || "Failed to fetch clients"));
                }
            } catch (error) {
                console.error("Error fetching clients:", error); // Log full error object
                // Optional: Dispatch an error action for Redux if needed
                 dispatch(setClientsError("A network error occurred."));
            }
        };

        fetchClients();
    }, [dispatch]); // Add dispatch to dependency array
};

export default useGetAllClients;