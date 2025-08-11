// Environment configuration
const config = {
  development: {
    BACKEND_URL: 'http://localhost:8000',
    FRONTEND_PORT: 5173,
    API_VERSION: 'v1'
  },
  production: {
    BACKEND_URL: process.env.VITE_BACKEND_URL || 'https://your-production-domain.com',
    FRONTEND_PORT: process.env.VITE_FRONTEND_PORT || 3000,
    API_VERSION: 'v1'
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = `${currentConfig.BACKEND_URL}/api/${currentConfig.API_VERSION}`;
export const FRONTEND_PORT = currentConfig.FRONTEND_PORT;

// API Endpoints
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
  AUDIT: `${API_BASE_URL}/audit`
};

export default currentConfig;

