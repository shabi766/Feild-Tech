import axios from 'axios';

// import { API_BASE_URL } from '../config/environment';

// Create axios instance with base configuration
// Create axios instance with base configuration
const api = axios.create({
  // baseURL: API_BASE_URL, // Removed for microservices support
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: we rely on httpOnly cookies for auth, so we don't
// attach JWTs from localStorage or readable cookies to the Authorization
// header anymore. Cookies are sent automatically when withCredentials=true.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Let React state/routers handle logout flows; we no longer manage
      // tokens in localStorage or non-httpOnly cookies here.
    }

    return Promise.reject(error);
  }
);

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Helper function to set cookie
export function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

// Helper function to remove cookie
export function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export default api;
