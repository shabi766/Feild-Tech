import React, { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/authSlice";
import api from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/environment";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector(store => store.auth);

    // Function to validate if the current authentication is still valid
    const validateAuth = async () => {
        if (!user) return false;

        try {
            // Use the same API endpoint as other components
            const response = await api.get(`${API_ENDPOINTS.USER}/me`);

            if (response.data.success) {
                return true;
            } else {
                // Token is invalid/expired, logout the user
                console.log('Token validation failed, logging out user');
                dispatch(logout());
                return false;
            }
        } catch (error) {
            console.error('Error validating authentication:', error);
            dispatch(logout());
            return false;
        }
    };

    const handleLogout = async () => {
        try {
            // Call backend logout endpoint to clear cookies
            await api.get(`${API_ENDPOINTS.USER}/logout`);
        } catch (error) {
            console.error('Error calling logout endpoint:', error);
        } finally {
            // Clear all authentication state regardless of backend call success
            dispatch(logout());
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, logout: handleLogout, validateAuth }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
export const useAuth = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a UserProvider');
    }
    return context;
};

export default UserContext;
