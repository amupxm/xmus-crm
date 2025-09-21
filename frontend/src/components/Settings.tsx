import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Configure your account and preferences</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">User Settings</h2>
        <p className="text-gray-400">
          This is a placeholder for the settings interface. 
          This page is visible to all authenticated users.
        </p>
      </div>
    </div>
  );
};
