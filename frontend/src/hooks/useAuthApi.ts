import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authApi, LoginRequest } from '../services/authApi';
import { AppDispatch, RootState } from '../store';
import { loadUser, login, logout, refreshAccessToken } from '../store/slices/authSlice';

export const useAuthApi = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const loginUser = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const result = await dispatch(login(credentials));
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const logoutUser = useCallback(async () => {
    try {
      await dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [dispatch]);

  const loadUserData = useCallback(async () => {
    try {
      const result = await dispatch(loadUser());
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Renamed to avoid name collision and undefined issue
  const refreshTokenAction = useCallback(async () => {
    try {
      const result = await dispatch(refreshAccessToken());
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken, // This is the value from state

    // Actions
    loginUser,
    logoutUser,
    loadUserData,

    // Direct API access (if needed)
    authApi,
    refreshTokenAction, // This is the function to refresh token
  };
}
