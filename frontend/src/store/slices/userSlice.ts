import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';
import { Permission, Role, Team, User } from '../../types';

export interface UserState {
  user: User | null;
  roles: Role[];
  teams: Team[];
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: UserState = {
  user: null,
  roles: [],
  teams: [],
  permissions: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to get current user data
export const getMe = createAsyncThunk(
  'user/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error: any) {
      // If it's a 401 or 403, we should clear auth and redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        // This will be handled by the API interceptor
        return rejectWithValue('Authentication required');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to get user data');
    }
  }
);

// Async thunk to refresh user data
export const refreshUserData = createAsyncThunk(
  'user/refreshUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh user data');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.roles = [];
      state.teams = [];
      state.permissions = [];
      state.isLoading = false;
      state.error = null;
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.roles = action.payload.roles || [];
      state.teams = action.payload.teams || [];
      state.permissions = action.payload.permissions || [];
      state.lastFetched = Date.now();
    },
  },
  extraReducers: (builder) => {
    // GetMe
    builder
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.roles = action.payload.data.roles || [];
        state.teams = action.payload.data.teams || [];
        state.permissions = []; // We'll need to fetch permissions separately
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Don't clear user data on error, let the auth interceptor handle it
      });

    // Refresh user data
    builder
      .addCase(refreshUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.roles = action.payload.data.roles || [];
        state.teams = action.payload.data.teams || [];
        state.permissions = []; // We'll need to fetch permissions separately
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser, clearError, setUser } = userSlice.actions;
export default userSlice.reducer;
