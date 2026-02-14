import { createSlice } from "@reduxjs/toolkit";

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
            // Token is no longer persisted on the client; we keep it only
            // in memory if needed for debugging/UI. Authentication relies
            // on the httpOnly cookie set by the backend.
            state.token = action.payload;
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