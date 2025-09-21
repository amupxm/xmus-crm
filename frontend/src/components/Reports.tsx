import React from 'react';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-2">Generate and view business reports</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Reports Dashboard</h2>
        <p className="text-gray-400">
          This is a placeholder for the reports interface. 
          This page is visible to users with admin, management, or hr roles.
        </p>
      </div>
    </div>
  );
};
