import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Admin: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const adminSections = [
    { name: 'User Management', href: '/admin/users', description: 'Manage system users' },
    { name: 'Role Management', href: '/admin/roles', description: 'Configure user roles' },
    { name: 'Permissions', href: '/admin/permissions', description: 'Manage system permissions' },
    { name: 'System Settings', href: '/admin/settings', description: 'Configure system settings' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Administration</h1>
        <p className="text-gray-400 mt-2">System administration and configuration</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminSections.map((section) => (
          <Link
            key={section.href}
            to={section.href}
            className={`p-6 rounded-lg border transition-all duration-200 ${
              isActive(section.href)
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
            <p className="text-sm text-gray-400">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
