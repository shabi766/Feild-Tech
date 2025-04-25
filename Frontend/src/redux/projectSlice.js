import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
    name:"project",
    initialState:{
        singleProject:null,
        projects:[],
        searchProjectByText:"",
      
    },
    reducers:{
        // actions
        setSingleProject:(state,action) => {
            state.singleProject = action.payload;
        },
        setProjects:(state,action)=>{
            state.projects = action.payload;
        },
        setSearchProjectsByText:(state,action) =>{
            state.searchProjectByText = action.payload;
        }
       
    }
});
export const {setSingleProject, setProjects, setSearchProjectsByText} = projectSlice.actions;
export default projectSlice.reducer;