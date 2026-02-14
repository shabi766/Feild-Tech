import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/environment";

const initialState = {
    unreadCount: 0,
    loading: false,
    error: null,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
            state.loading = false;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
        decrementUnreadCount: (state, amount = 1) => {
            state.unreadCount = Math.max(0, state.unreadCount - amount);
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    setLoading,
    setUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    setError
} = chatSlice.actions;

// Thunks

export const fetchUnreadCount = (userId) => async (dispatch) => {
    if (!userId) return;

    try {
        // dispatch(setLoading(true)); // Optional: might not want global loading state for a badge
        const url = `${API_ENDPOINTS.CHAT}/unread-count/${userId}`;
        const { data } = await axios.get(url, { withCredentials: true });

        if (data.success) {
            dispatch(setUnreadCount(data.count));
        }
    } catch (error) {
        console.error("Error fetching unread count:", error);
        // Don't set global error for background fetch
    } finally {
        dispatch(setLoading(false));
    }
};

export default chatSlice.reducer;
