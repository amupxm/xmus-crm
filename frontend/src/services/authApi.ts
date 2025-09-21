import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<{ data: LoginResponse }> => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ data: RefreshTokenResponse }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response;
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  // Get current user
  getCurrentUser: async (): Promise<{ data: User }> => {
    const response = await api.get('/auth/me');
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
