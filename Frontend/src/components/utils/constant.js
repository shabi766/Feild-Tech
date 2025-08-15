// Import base URL from environment config
import { API_BASE_URL } from '../../config/environment';

// Define API endpoints directly to avoid import issues
export const API_ENDPOINTS = {
  USER: `${API_BASE_URL}/user`,
  JOB: `${API_BASE_URL}/workorder`,
  APPLICATION: `${API_BASE_URL}/application`,
  COMPANY: `${API_BASE_URL}/company`,
  CLIENT: `${API_BASE_URL}/client`,
  PROJECT: `${API_BASE_URL}/project`,
  TECHNICIAN: `${API_BASE_URL}/technician`,
  SEARCH: `${API_BASE_URL}/search`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  NOTIFICATION: `${API_BASE_URL}/notification`,
  CHAT: `${API_BASE_URL}/chat`,
  WALLET: `${API_BASE_URL}/wallet`,
  ADMINISTRATION: `${API_BASE_URL}/administration`,
  AUDIT: `${API_BASE_URL}/audit`,
  REVIEW: `${API_BASE_URL}/review`,
  LEADERBOARD: `${API_BASE_URL}/leaderboard`,
};

// Legacy exports for backward compatibility
export const USER_API_END_POINT = API_ENDPOINTS.USER;
export const JOB_API_END_POINT = API_ENDPOINTS.JOB;
export const APPLICATION_API_END_POINT = API_ENDPOINTS.APPLICATION;
export const COMPANY_API_END_POINT = API_ENDPOINTS.COMPANY;
export const CLIENT_API_END_POINT = API_ENDPOINTS.CLIENT;
export const PROJECT_API_END_POINT = API_ENDPOINTS.PROJECT;
export const TECHNICIAN_API_END_POINT = API_ENDPOINTS.TECHNICIAN;
export const SEARCH_API_END_POINT = API_ENDPOINTS.SEARCH;
export const DASHBOARD_API_END_POINT = API_ENDPOINTS.DASHBOARD;
export const NOTIFICATION_API_END_POINT = API_ENDPOINTS.NOTIFICATION;
export const CHAT_API_END_POINT = API_ENDPOINTS.CHAT;
export const WALLET_API_END_POINT = API_ENDPOINTS.WALLET;
export const ADMINISTRATION_API_END_POINT = API_ENDPOINTS.ADMINISTRATION;
export const AUDIT_API_END_POINT = API_ENDPOINTS.AUDIT;
export const REVIEW_API_END_POINT = API_ENDPOINTS.REVIEW;
export const LEADERBOARD_API_END_POINT = API_ENDPOINTS.LEADERBOARD;
