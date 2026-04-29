import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: 'https://testi-hub-backend.vercel.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Interceptor for Access Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add Response Interceptor for 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and session was revoked (Another login detected)
    if (error.response?.status === 401 && error.response?.data?.error === 'SESSION_REVOKED') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      toast.error('Session Revoked', {
        description: 'You have been signed out because another login was detected on a different device or browser.'
      });
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If 401 and not already retrying (Standard Token Refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `https://testi-hub-backend.vercel.app/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
