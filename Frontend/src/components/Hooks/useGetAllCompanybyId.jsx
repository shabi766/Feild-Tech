import { setSingleCompany } from '@/redux/companySlice';
import { COMPANY_API_END_POINT } from '@/components/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useGetAllCompanybyId = (companyId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSingleCompany = async () => {
            if (!companyId) {
                dispatch(setSingleCompany(null)); // Clear company data if companyId is nullish
                return; // Exit early
            }

            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}`, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setSingleCompany(res.data.company));
                } else {
                    console.error("Failed to fetch company:", res.data.message || "Unknown error");
                    // Optional: Dispatch an error action to Redux if needed
                     dispatch(setSingleCompanyError(res.data.message || "Failed to fetch company"));
                    dispatch(setSingleCompany(null)); // Clear company on error
                }
            } catch (error) {
                console.error("Error fetching company:", error); // Log the full error object
                // Optional: Dispatch an error action to Redux if needed
                 dispatch(setSingleCompanyError("A network error occurred."));
                dispatch(setSingleCompany(null)); // Clear company on error
            }
        };

        if (companyId) { // Keep this check to prevent API calls with invalid IDs
            fetchSingleCompany();
        } else {
            dispatch(setSingleCompany(null)); // Clear if companyId is initially nullish
        }
    }, [companyId, dispatch]); // dispatch is a dependency
};

export default useGetAllCompanybyId;