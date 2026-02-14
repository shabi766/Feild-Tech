import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/environment";

const initialState = {
    ratings: [],
    entityRatings: {},
    averageRating: null,
    loading: false,
    error: null,
};

const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setRatings: (state, action) => {
            state.ratings = action.payload;
            state.loading = false;
        },
        setEntityRatings: (state, action) => {
            const { entityId, data } = action.payload;
            state.entityRatings[entityId] = data;
            state.loading = false;
        },
        setAverageRating: (state, action) => {
            state.averageRating = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        addRatingSuccess: (state, action) => {
            state.ratings.unshift(action.payload);
            state.loading = false;
        },
    },
});

export const {
    setLoading,
    setRatings,
    setEntityRatings,
    setAverageRating,
    setError,
    addRatingSuccess
} = reviewSlice.actions;

// Thunks

export const fetchEntityRatings = (entityType, entityId, params = {}) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        // Construct query params string
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_ENDPOINTS.RATING}/${entityType}/${entityId}?${queryParams}`;

        const { data } = await axios.get(url, { withCredentials: true });

        if (data.success) {
            dispatch(setEntityRatings({ entityId, data: data.data }));
        }
    } catch (error) {
        console.error("Error fetching ratings:", error);
        dispatch(setError(error.response?.data?.message || "Failed to fetch ratings"));
    }
};

export const fetchAverageRating = (entityType, entityId) => async (dispatch) => {
    try {
        const url = `${API_ENDPOINTS.RATING}/${entityType}/${entityId}/average`;
        const { data } = await axios.get(url, { withCredentials: true });

        if (data.success) {
            // Can handle this state however needed, for now just logging/returning
            return data.data;
        }
    } catch (error) {
        console.error("Error fetching average rating:", error);
    }
};

export const createRating = (ratingData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const { data } = await axios.post(
            `${API_ENDPOINTS.RATING}`,
            ratingData,
            { withCredentials: true }
        );

        if (data.success) {
            dispatch(addRatingSuccess(data.data));
            return data;
        }
    } catch (error) {
        console.error("Error creating rating:", error);
        const message = error.response?.data?.message || "Failed to submit rating";
        dispatch(setError(message));
        throw new Error(message);
    }
};

export default reviewSlice.reducer;
