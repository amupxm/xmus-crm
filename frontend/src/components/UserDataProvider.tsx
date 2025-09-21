import React, { useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { UserLoading } from './UserLoading';

interface UserDataProviderProps {
  children: React.ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    error, 
    loadUserData 
  } = useUser();

  useEffect(() => {
    // If authenticated but no user data, try to load it
    if (isAuthenticated && !user && !isLoading) {
      loadUserData();
    }
  }, [isAuthenticated, user, isLoading, loadUserData]);

  // Show loading if we're authenticated but still loading user data
  if (isAuthenticated && !user && isLoading) {
    return <UserLoading message="Loading your profile..." />;
  }

  // Show error if there's an error loading user data
  if (isAuthenticated && error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">
            Failed to load user data: {error}
          </div>
          <button 
            onClick={() => loadUserData()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If not authenticated, don't show loading
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If authenticated and user data is loaded, show children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Default loading state
  return <UserLoading />;
};
