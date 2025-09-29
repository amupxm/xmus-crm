import React from 'react';
import { useUser } from '../hooks/useUser';

interface RoleBasedAccessProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null 
}) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <>{fallback}</>;
  }

  // Check if user has any of the allowed roles
  const hasAccess = user.roles?.some(role => 
    allowedRoles.includes(role.name.toLowerCase())
  ) || false;

  if (!hasAccess) {
    return (
      <>
        {fallback || (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <div className="text-red-400 text-xl mb-2">🚫</div>
            <h3 className="text-red-400 font-semibold mb-2">Access Denied</h3>
            <p className="text-red-300">
              You don't have permission to access this section.
            </p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};
