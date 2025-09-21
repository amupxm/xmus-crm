import React from 'react';

export const Projects: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <p className="text-gray-400 mt-2">Manage and track project progress</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Project Management</h2>
        <p className="text-gray-400">
          This is a placeholder for the project management interface. 
          This page is visible to users with admin, project_manager, or developer roles.
        </p>
      </div>
    </div>
  );
};
