import React from 'react';

export const Sales: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Sales</h1>
        <p className="text-gray-400 mt-2">Track and manage sales activities</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Sales Dashboard</h2>
        <p className="text-gray-400">
          This is a placeholder for the sales management interface. 
          This page is visible to users with admin, sales_manager, or sales_rep roles.
        </p>
      </div>
    </div>
  );
};
