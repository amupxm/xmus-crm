import React from 'react';

export const Teams: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Teams</h1>
        <p className="text-gray-400 mt-2">Manage teams and team members</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Team Management</h2>
        <p className="text-gray-400">
          This is a placeholder for the team management interface. 
          This page is visible to users with admin, management, hr, or team_lead roles.
        </p>
      </div>
    </div>
  );
};
