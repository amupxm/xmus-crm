import { ILeaveRequestCreate } from "@internal-cms/shared/src/api/leaves";
import axios, { AxiosInstance } from "axios";
import useAuthStore from "../stores/authStore"; // Adjust path as needed

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for cookie-based auth
});

// Helper to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof window !== "undefined") {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Helper to handle auth failure
const handleAuthFailure = () => {
  if (typeof window !== "undefined") {
    // Clear cookies
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Update auth store
    const { clearAuth } = useAuthStore.getState();
    clearAuth();

    // Redirect to login
    window.location.href = "/login";
  }
};

// Response Interceptor: Handle 401s and Refresh Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check if refresh token exists in cookie
        const refreshToken = getCookie('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh token using cookie-based refresh
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true, // Send cookies with refresh request
        });

        // If refresh successful, retry original request
        if (response.status === 200) {
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - update auth store and redirect
        console.error('Token refresh failed:', refreshError);
        handleAuthFailure();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout");

      // Clear cookies and update auth store
      if (typeof window !== "undefined") {
        document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Update auth store
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
      }

      return response.data;
    } catch (error) {
      // Even if logout fails, clear local state
      handleAuthFailure();
      throw error;
    }
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export const leaveAPI = {
  addNew: async (data: ILeaveRequestCreate) => {
    const response = await api.post("/leave/new", data);
    return response.data;
  },
  getRequests: async () => {
    const response = await api.get("/leave/requests");
    return response.data;
  },
  getYearlyHolidays: async () => {
    const response = await api.get("/leave/yearly-holidays");

    return response.data;
  }
};


export const requestAPI = {
  getAll: async () => {
    const response = await api.get("/request/all");
    return response.data;
  }
}

export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get("/user/all");
    return response.data;
  },
}
export default api;