import React from 'react';

interface UserLoadingProps {
  message?: string;
}

export const UserLoading: React.FC<UserLoadingProps> = ({ 
  message = "Loading user data..." 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};
