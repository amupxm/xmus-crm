import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useAuthApi } from '../hooks/useAuthApi';
import { store } from '../store';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loadUserData, isAuthenticated, accessToken } = useAuthApi();

  useEffect(() => {
    // Check if user is authenticated on app load
    if (accessToken && !isAuthenticated) {
      loadUserData().catch((error) => {
        console.error('Failed to load user:', error);
      });
    }
  }, [accessToken, isAuthenticated, loadUserData]);

  return <>{children}</>;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Provider>
  );
};
