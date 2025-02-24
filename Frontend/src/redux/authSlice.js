import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null
    },
    reducers:{
        setloading:(state, action)=>{
            state.loading = action.payload;
        },
        setuser:(state, action) =>{
            state.user = action.payload;
        }
    }
});
export const {setloading, setuser} = authSlice.actions;
export default authSlice.reducer;