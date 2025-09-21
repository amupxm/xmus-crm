import { UserResponse } from '../types';
import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      is_active: boolean;
      last_login?: string;
    };
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<{ data: LoginResponse }> => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ data: RefreshTokenResponse }> => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response;
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  // Get current user
  getCurrentUser: async (): Promise<{ data: UserResponse }> => {
    const response = await api.get('/users/get_me');
    return response;
  },

  // Register user (if needed)
  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ data: LoginResponse }> => {
    const response = await api.post('/auth/register', userData);
    return response;
  },
};
