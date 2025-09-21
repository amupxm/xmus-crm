import React from 'react';

export const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400 mt-2">View and manage your notifications</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Notification Center</h2>
        <p className="text-gray-400">
          This is a placeholder for the notifications interface. 
          This page is visible to all authenticated users.
        </p>
      </div>
    </div>
  );
};
