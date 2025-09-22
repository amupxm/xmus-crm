import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { useUser } from '../hooks/useUser';
import { initializeApi } from '../services/initApi';
import { AppDispatch, store } from '../store';
import { initializeAuth } from '../store/slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Initialize API interceptors and auth state after store is ready
  useEffect(() => {
    initializeApi();
    // Initialize authentication state on app load
    dispatch(initializeAuth());
  }, [dispatch]);

  // This will automatically handle loading user data when authenticated
  useUser();

  return <>{children}</>;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Provider>
  );
};
