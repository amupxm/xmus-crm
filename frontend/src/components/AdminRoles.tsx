import React from 'react';

export const AdminRoles: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Role Management</h1>
        <p className="text-gray-400 mt-2">Configure user roles and permissions</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Role Management Interface</h2>
        <p className="text-gray-400">
          This is a placeholder for the role management interface. 
          This page is only visible to admin users.
        </p>
      </div>
    </div>
  );
};
