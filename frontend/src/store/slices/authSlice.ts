import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';
import { User } from '../../types';

// Utility function to check if a JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
};

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper function to get initial auth state
const getInitialAuthState = (): AuthState => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Check if tokens exist and are not expired
  const isAccessTokenValid = accessToken && !isTokenExpired(accessToken);
  const isRefreshTokenValid = refreshToken && !isTokenExpired(refreshToken);
  
  return {
    user: null,
    accessToken: isAccessTokenValid ? accessToken : null,
    refreshToken: isRefreshTokenValid ? refreshToken : null,
    isAuthenticated: (isAccessTokenValid != null && isAccessTokenValid != false && isRefreshTokenValid != null && isRefreshTokenValid != false),
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialAuthState();

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshToken);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const accessToken = state.auth.accessToken;
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load user');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const accessToken = state.auth.accessToken;
      const refreshToken = state.auth.refreshToken;
      
      // If no tokens, user is not authenticated
      if (!accessToken || !refreshToken) {
        return { isAuthenticated: false };
      }

      // Check if access token is expired
      if (isTokenExpired(accessToken)) {
        // If access token is expired, try to refresh it
        if (!isTokenExpired(refreshToken)) {
          try {
            const refreshResponse = await authApi.refreshToken(refreshToken);
            return {
              isAuthenticated: true,
              accessToken: refreshResponse.data.data.access_token,
              refreshToken: refreshResponse.data.data.refresh_token,
            };
          } catch (refreshError) {
            // Refresh failed, user needs to login again
            return { isAuthenticated: false };
          }
        } else {
          // Both tokens are expired
          return { isAuthenticated: false };
        }
      }

      // Access token is valid, try to validate it by making a request to get current user
      try {
        const response = await authApi.getCurrentUser();
        return { 
          isAuthenticated: true, 
          user: response.data.data 
        };
      } catch (error: any) {
        // If the access token is invalid, try to refresh it
        if (error.response?.status === 401) {
          try {
            const refreshResponse = await authApi.refreshToken(refreshToken);
            return {
              isAuthenticated: true,
              accessToken: refreshResponse.data.data.access_token,
              refreshToken: refreshResponse.data.data.refresh_token,
            };
          } catch (refreshError) {
            // Refresh failed, user needs to login again
            return { isAuthenticated: false };
          }
        }
        throw error;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize auth');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearExpiredTokens: (state) => {
      // Check and clear expired tokens
      if (state.accessToken && isTokenExpired(state.accessToken)) {
        state.accessToken = null;
        localStorage.removeItem('accessToken');
      }
      if (state.refreshToken && isTokenExpired(state.refreshToken)) {
        state.refreshToken = null;
        localStorage.removeItem('refreshToken');
      }
      // Update authentication status
      state.isAuthenticated = !!(state.accessToken && state.refreshToken);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        // Map login user to main User interface
        state.user = {
          id: action.payload.data.user.id,
          email: action.payload.data.user.email,
          first_name: action.payload.data.user.first_name,
          last_name: action.payload.data.user.last_name,
          is_active: action.payload.data.user.is_active,
          salary: 0,
          salary_currency: 'USD',
          primary_role_id: 0,
          primary_team_id: 0,
          roles: [],
          teams: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        state.accessToken = action.payload.data.access_token;
        state.refreshToken = action.payload.data.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', action.payload.data.access_token);
        localStorage.setItem('refreshToken', action.payload.data.refresh_token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Refresh token
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.data.access_token;
        state.refreshToken = action.payload.data.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
        
        // Update tokens in localStorage
        localStorage.setItem('accessToken', action.payload.data.access_token);
        localStorage.setItem('refreshToken', action.payload.data.refresh_token);
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });

    // Load user
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });

    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        
        if (action.payload.isAuthenticated) {
          if (action.payload.user) {
            state.user = action.payload.user;
          }
          if (action.payload.accessToken) {
            state.accessToken = action.payload.accessToken;
            localStorage.setItem('accessToken', action.payload.accessToken);
          }
          if (action.payload.refreshToken) {
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem('refreshToken', action.payload.refreshToken);
          }
        } else {
          // Clear auth state if not authenticated
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
  },
});

export const { clearError, clearAuth, clearExpiredTokens } = authSlice.actions;
export default authSlice.reducer;
