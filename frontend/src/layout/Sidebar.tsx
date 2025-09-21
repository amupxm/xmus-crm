import { BarChart3, DollarSign, Home, Settings, Users } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Sales', href: '/sales', icon: DollarSign },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
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
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-500/20 text-blue-400 neon-glow'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">U</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">User</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
