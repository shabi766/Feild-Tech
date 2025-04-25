// src/redux/jobPostSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  title: '',
  template: '',
  client: '',
  projectId: '',
  description: '',
  IncidentID: '',
  Teams: '',
  requiredTools: '',
  skills: '',
  rate: '',
  rateType: 'fixed',
  jobType: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  startTime: new Date().toISOString(), // Store as ISO string initially
  endTime: null,                     // Store as ISO string or null
  partTime: { base: '', hourlyHours: 0, dailyDays: 0, contractMonths: 0, weeklyDays: 0 },
  fullTime: { base: '', contractMonths: 0 },
  totalJobTime: '',
  totalJobDuration: '',
  siteContact: '',
  SecondaryContact: '',
  attachments: [],
};

export const jobPostSlice = createSlice({
  name: 'jobPost',
  initialState,
  reducers: {
    updateJobPostField: (state, action) => {
      state[action.payload.name] = action.payload.value;
    },
    updateJobPostNestedField: (state, action) => {
      if (state[action.payload.parent]) {
        state[action.payload.parent][action.payload.name] = action.payload.value;
      }
    },
    updateJobPost: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetJobPost: (state) => {
      return initialState;
    },
    addAttachment: (state, action) => {
      state.attachments.push({ name: action.payload.name, size: action.payload.size, type: action.payload.type });
    },
    removeAttachment: (state, action) => {
      state.attachments = state.attachments.filter((_, index) => index !== action.payload);
    },
  },
});

export const {
  updateJobPostField,
  updateJobPostNestedField,
  updateJobPost,
  resetJobPost,
  addAttachment,
  removeAttachment,
} = jobPostSlice.actions;

export default jobPostSlice.reducer;