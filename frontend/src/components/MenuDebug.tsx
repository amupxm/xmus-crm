import React from 'react';
import { filterMenuItems, menuItems } from '../config/menu';
import { useUser } from '../hooks/useUser';

export const MenuDebug: React.FC = () => {
  const { roles, permissions } = useUser();
  const filteredMenuItems = filterMenuItems(menuItems, roles.map(role => role.name), permissions.map(permission => permission.key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Menu Debug</h1>
        <p className="text-gray-400 mt-2">Debug information for menu filtering</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">User Roles</h2>
          <div className="space-y-2">
            {roles.length > 0 ? (
              roles.map((role, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-300">{role.name}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No roles assigned</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">User Permissions</h2>
          <div className="space-y-2">
            {permissions.length > 0 ? (
              permissions.map((permission, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-300">{permission.key}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No permissions loaded</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Available Menu Items</h2>
        <div className="space-y-2">
          {filteredMenuItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">{item.name}</span>
              {item.children && item.children.length > 0 && (
                <span className="text-xs text-gray-500">({item.children.length} sub-items)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">All Menu Items (Unfiltered)</h2>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">{item.name}</span>
              <span className="text-xs text-gray-600">
                (Roles: {item.requiredRoles?.join(', ') || 'None'})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
