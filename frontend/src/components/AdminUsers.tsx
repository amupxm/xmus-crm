import React from 'react';

export const AdminUsers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-2">Manage system users and their access</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">User Management Interface</h2>
        <p className="text-gray-400">
          This is a placeholder for the user management interface. 
          This page is only visible to admin users.
        </p>
      </div>
    </div>
  );
};
