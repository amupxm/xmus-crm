import React from 'react';
import { useUser } from '../hooks/useUser';

export const UserProfile: React.FC = () => {
  const { 
    user, 
    roles, 
    permissions, 
    isLoading, 
    hasRole, 
    hasPermission,
    getPrimaryRole,
    getPrimaryTeam,
    refreshUser 
  } = useUser();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-red-600">No user data available</div>
      </div>
    );
  }

  const primaryRole = getPrimaryRole();
  const primaryTeam = getPrimaryTeam();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <button
            onClick={refreshUser}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Status:</span> {user.is_active ? 'Active' : 'Inactive'}</p>
              <p><span className="font-medium">Salary:</span> {user.salary_currency} {user.salary.toLocaleString()}</p>
              <p><span className="font-medium">Last Login:</span> {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</p>
              <p><span className="font-medium">Member Since:</span> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Primary Role & Team */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Primary Assignment</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Primary Role:</span> 
                {primaryRole ? (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {primaryRole.name}
                  </span>
                ) : (
                  <span className="text-gray-500 ml-2">Not assigned</span>
                )}
              </p>
              <p>
                <span className="font-medium">Primary Team:</span> 
                {primaryTeam ? (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {primaryTeam.name}
                  </span>
                ) : (
                  <span className="text-gray-500 ml-2">Not assigned</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Roles ({roles.length})</h2>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role.id}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {role.name}
              </span>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Permissions ({permissions.length})</h2>
          <div className="flex flex-wrap gap-2">
            {permissions.map((permission) => (
              <span
                key={permission.id}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                {permission.key}
              </span>
            ))}
          </div>
        </div>

        {/* Role Checks */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Role Checks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Admin</div>
              <div className={`font-bold ${hasRole('ADMIN') ? 'text-green-600' : 'text-red-600'}`}>
                {hasRole('ADMIN') ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">HR</div>
              <div className={`font-bold ${hasRole('HR') ? 'text-green-600' : 'text-red-600'}`}>
                {hasRole('HR') ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Team Lead</div>
              <div className={`font-bold ${hasRole('TEAM_LEAD') ? 'text-green-600' : 'text-red-600'}`}>
                {hasRole('TEAM_LEAD') ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Employee</div>
              <div className={`font-bold ${hasRole('EMPLOYEE') ? 'text-green-600' : 'text-red-600'}`}>
                {hasRole('EMPLOYEE') ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
