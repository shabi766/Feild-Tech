import { createSlice } from "@reduxjs/toolkit";
import { setCookie, removeCookie } from '../lib/axios';

const initialState = {
    loading: false,
    user: null,
    token: null,
    isAuthenticated: false,
    error: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
            state.error = null; // Clear errors when loading
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.error = null;
        },
        setToken: (state, action) => {
            state.token = action.payload;
            if (action.payload) {
                // Store token in localStorage and cookie
                localStorage.setItem('authToken', action.payload);
                setCookie('token', action.payload, 7);
            }
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            state.loading = false;
            
            // Clear from localStorage and cookies
            localStorage.removeItem('authToken');
            removeCookie('token');
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const { 
    setLoading, 
    setUser, 
    setToken, 
    setError, 
    logout, 
    clearError 
} = authSlice.actions;

export default authSlice.reducer;