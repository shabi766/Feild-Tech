import { SERVICE_PORTS, getServiceUrl } from './services';

// Environment configuration
// NOTE:
// - All HTTP REST APIs are exposed directly by their respective microservices
//   on localhost ports defined in SERVICE_PORTS.
// - The legacy API gateway on port 8000 is now used only for real-time
//   Socket.io connections (see Backend/index.js) and should NOT be used as
//   the base URL for REST calls.
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

// Currently kept for backwards compatibility; new code should prefer the
// service-specific URLs exposed via API_ENDPOINTS below.
export const API_BASE_URL = `${currentConfig.BACKEND_URL}/api/${currentConfig.API_VERSION}`;
export const FRONTEND_PORT = currentConfig.FRONTEND_PORT;

// API Endpoints
// Map endpoints to specific microservices. Frontend code should use these
// constants instead of hard-coded URLs or relative paths.
export const API_ENDPOINTS = {
  AUTH: `${getServiceUrl(SERVICE_PORTS.AUTH)}/auth`,
  USER: `${getServiceUrl(SERVICE_PORTS.AUTH)}/auth`,
  JOB: `${getServiceUrl(SERVICE_PORTS.WORKORDER)}/workorder`,
  APPLICATION: `${getServiceUrl(SERVICE_PORTS.APPLICATION)}/application`,
  COMPANY: `${getServiceUrl(SERVICE_PORTS.COMPANY)}/company`,
  COMPANY_REGISTRATION: `${getServiceUrl(SERVICE_PORTS.COMPANY)}/company-registration`,
  CLIENT: `${getServiceUrl(SERVICE_PORTS.CLIENT)}/client`,
  PROJECT: `${getServiceUrl(SERVICE_PORTS.CLIENT)}/project`,
  TECHNICIAN: `${getServiceUrl(SERVICE_PORTS.SEARCH)}/technician`,
  SEARCH: `${getServiceUrl(SERVICE_PORTS.SEARCH)}/search`,
  DASHBOARD: `${getServiceUrl(SERVICE_PORTS.ADMIN)}/admin/dashboard`,
  NOTIFICATION: `${getServiceUrl(SERVICE_PORTS.NOTIFICATION)}/notification`,
  CHAT: `${getServiceUrl(SERVICE_PORTS.CHAT)}/chat`,
  WALLET: `${getServiceUrl(SERVICE_PORTS.PAYMENT)}/wallet`,
  PAYMENT: `${getServiceUrl(SERVICE_PORTS.PAYMENT)}/payment`,
  ADMINISTRATION: `${getServiceUrl(SERVICE_PORTS.ADMIN)}/admin`,
  AUDIT: `${getServiceUrl(SERVICE_PORTS.ADMIN)}/admin/audit`,
  REVIEW: `${getServiceUrl(SERVICE_PORTS.REVIEW)}/review`,
  LEADERBOARD: `${getServiceUrl(SERVICE_PORTS.REVIEW)}/leaderboard`,
};

export default currentConfig;

 