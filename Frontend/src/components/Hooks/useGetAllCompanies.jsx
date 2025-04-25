import { setCompanies } from '@/redux/companySlice';
import { COMPANY_API_END_POINT } from '@/components/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useGetAllCompanies = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get`, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setCompanies(res.data.companies));
                } else {
                    console.error("Failed to fetch companies:", res.data.message || "Unknown error"); // Log server error message
                    // Optional: Dispatch an error action to Redux if needed
                     dispatch(setCompaniesError(res.data.message || "Failed to fetch companies"));
                }
            } catch (error) {
                console.error("Error fetching companies:", error); // Log the full error object
                // Optional: Dispatch an error action to Redux if needed
                dispatch(setCompaniesError("A network error occurred."));
            }
        };

        fetchCompanies();
    }, [dispatch]); // Add dispatch to dependency array
};

export default useGetAllCompanies;