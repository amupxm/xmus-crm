import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useUser } from '../hooks/useUser';
import { initializeApi } from '../services/initApi';
import { store } from '../store';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize API interceptors after store is ready
  useEffect(() => {
    initializeApi();
  }, []);

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
