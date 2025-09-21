import { ChevronDown, ChevronRight, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { filterMenuItems, menuItems } from '../config/menu';
import { useUser } from '../hooks/useUser';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { roles, permissions } = useUser();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Filter menu items based on user permissions
  const filteredMenuItems = filterMenuItems(menuItems, roles.map(role => role.name), permissions.map(permission => permission.key));

  const renderMenuItem = (item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive = isActive(item.href);

    return (
      <div key={item.id}>
        <div className="flex items-center">
          <Link
            to={item.href}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-1 ${
              isItemActive
                ? 'bg-blue-500/20 text-blue-400 neon-glow'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
            onClick={onClose}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((child: any) => (
              <Link
                key={child.id}
                to={child.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(child.href)
                    ? 'bg-blue-500/20 text-blue-400 neon-glow'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                onClick={onClose}
              >
                <child.icon className="w-4 h-4 mr-3" />
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="glass-dark border-r border-gray-700 flex flex-col h-full">
          <div className="px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center neon-glow">
                  <span className="text-white font-bold text-lg">X</span>
                </div>
                <span className="text-xl font-bold gradient-text">
                  XMUS CRM
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 px-2">
            <nav className="space-y-1">
              {filteredMenuItems.map(renderMenuItem)}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="glass-dark border-r border-gray-700 flex flex-col h-full">
          <div className="px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center neon-glow">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="text-xl font-bold gradient-text">
                XMUS CRM
              </span>
            </div>
          </div>
          
          <div className="flex-1 px-2">
            <nav className="space-y-1">
              {filteredMenuItems.map(renderMenuItem)}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};
