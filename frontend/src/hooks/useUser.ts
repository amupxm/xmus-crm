import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { clearAuth } from '../store/slices/authSlice';
import { clearUser, getMe, refreshUserData } from '../store/slices/userSlice';

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const auth = useSelector((state: RootState) => state.auth);

  // Check if user data is stale (older than 5 minutes)
  const isUserDataStale = useCallback(() => {
    if (!user.lastFetched) return true;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - user.lastFetched > fiveMinutes;
  }, [user.lastFetched]);

  // Get user data if not loaded or stale
  const loadUserData = useCallback(async () => {
    if (!auth.accessToken) {
      return;
    }

    // If user data is empty or stale, fetch it
    if (!user.user || isUserDataStale()) {
      try {
        await dispatch(getMe()).unwrap();
      } catch (error) {
        console.error('Failed to load user data:', error);
        // If it's an auth error, clear auth and redirect
        if (error === 'Authentication required') {
          dispatch(clearAuth());
          dispatch(clearUser());
          navigate('/login');
        }
      }
    }
  }, [auth.accessToken, user.user, isUserDataStale, dispatch, navigate]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!auth.accessToken) {
      return;
    }

    try {
      await dispatch(refreshUserData()).unwrap();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If it's an auth error, clear auth and redirect
      if (error === 'Authentication required') {
        dispatch(clearAuth());
        dispatch(clearUser());
        navigate('/login');
      }
    }
  }, [auth.accessToken, dispatch, navigate]);

  // Clear user data
  const clearUserData = useCallback(() => {
    dispatch(clearUser());
  }, [dispatch]);

  // Check if user has a specific role
  const hasRole = useCallback((roleName: string) => {
    return user.roles.some(role => role.name === roleName);
  }, [user.roles]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roleNames: string[]) => {
    return user.roles.some(role => roleNames.includes(role.name));
  }, [user.roles]);

  // Check if user has a specific permission (if permissions are loaded)
  const hasPermission = useCallback((permissionKey: string) => {
    return user.permissions.some(permission => permission.key === permissionKey);
  }, [user.permissions]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissionKeys: string[]) => {
    return user.permissions.some(permission => permissionKeys.includes(permission.key));
  }, [user.permissions]);

  // Get user's primary role
  const getPrimaryRole = useCallback(() => {
    if (!user.user) return null;
    return user.roles.find(role => role.id === user.user?.primary_role_id);
  }, [user.user, user.roles]);

  // Get user's primary team
  const getPrimaryTeam = useCallback(() => {
    if (!user.user) return null;
    return user.teams.find(team => team.id === user.user?.primary_team_id);
  }, [user.user, user.teams]);

  // Auto-load user data when component mounts or auth changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.accessToken) {
      loadUserData();
    } else if (!auth.isAuthenticated) {
      clearUserData();
    }
  }, [auth.isAuthenticated, auth.accessToken, loadUserData, clearUserData]);

  return {
    // State
    user: user.user,
    roles: user.roles,
    teams: user.teams,
    permissions: user.permissions,
    isLoading: user.isLoading,
    error: user.error,
    isAuthenticated: auth.isAuthenticated,
    
    // Actions
    loadUserData,
    refreshUser,
    clearUserData,
    
    // Utility functions
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    getPrimaryRole,
    getPrimaryTeam,
    isUserDataStale: isUserDataStale(),
  };
};
