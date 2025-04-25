import { CLIENT_API_END_POINT } from '@/components/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSingleClient } from '@/redux/clientSlice';

const useGetAllClientsbyId = (clientId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSingleClient = async () => {
            if (!clientId) {
                dispatch(setSingleClient(null)); // Clear client data if clientId is nullish
                return; // Exit early
            }

            try {
                const res = await axios.get(`${CLIENT_API_END_POINT}/get/${clientId}`, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setSingleClient(res.data.client));
                } else {
                    console.error("Failed to fetch client:", res.data.message || "Unknown error");
                    // Optional: Dispatch an error action to Redux if needed
                    dispatch(setSingleClientError(res.data.message || "Failed to fetch client"));
                    dispatch(setSingleClient(null)); // Clear client on error as well.
                }
            } catch (error) {
                console.error("Error fetching client:", error); // Log the full error
                // Optional: Dispatch an error action to Redux if needed
                 dispatch(setSingleClientError("A network error occurred."));
                dispatch(setSingleClient(null)); // Clear client on error as well.
            }
        };

        if (clientId) { // Keep this check to prevent API calls with invalid IDs
            fetchSingleClient();
        } else {
            dispatch(setSingleClient(null)); // Clear client data if clientId is initially nullish
        }
    }, [clientId, dispatch]); // dispatch is a dependency

    const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

    useEffect(() => {
         setLoading(true); // Set loading to true before fetching
         fetchSingleClient(); // Call the function inside useEffect
     }, [clientId, dispatch]);

     return { client: useSelector(selectSingleClient), loading, error };
};

export default useGetAllClientsbyId;