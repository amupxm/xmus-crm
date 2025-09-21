import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { store } from '../store';
import { clearAuth, refreshAccessToken } from '../store/slices/authSlice';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const state = store.getState();
      const refreshToken = state.auth.refreshToken;
      
      // If we have a refresh token, try to refresh
      if (refreshToken) {
        try {
          await store.dispatch(refreshAccessToken());
          
          // Retry the original request with new token
          const newState = store.getState();
          const newToken = newState.auth.accessToken;
          
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          store.dispatch(clearAuth());
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear auth and redirect to login
        store.dispatch(clearAuth());
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
