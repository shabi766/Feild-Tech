import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { USER_API_END_POINT } from "@/components/utils/constant";

const initialState = {
    user: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        updateUserSuccess: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setUser, updateUserSuccess, setError } = userSlice.actions;

// ✅ **Thunk for updating user settings**
export const updateUserSettings = (settings) => async (dispatch, getState) => {
    try {
        const { user } = getState().auth;
        const { data } = await axios.put(
            `${USER_API_END_POINT}/update/${user._id}`,
            settings,
            { withCredentials: true }
        );
        dispatch(updateUserSuccess(data.user));
    } catch (error) {
        dispatch(setError(error.response?.data?.message || "Failed to update settings"));
    }
};
export const deleteAccount = () => async (dispatch, getState) => {
    try {
        const { user } = getState().auth;
        await axios.delete(`${USER_API_END_POINT}/delete-account/${user._id}`, { withCredentials: true });
        dispatch(setUser(null)); 
    } catch (error) {
        dispatch(setError(error.response?.data?.message || "Failed to delete account"));
    }
};
export default userSlice.reducer;
