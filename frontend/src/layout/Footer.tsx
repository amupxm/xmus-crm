import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <span className="text-sm text-gray-500">
              © 2024 XMUS CRM. All rights reserved.
            </span>
          </div>
          
          <div className="mt-4 md:mt-0">
            <nav className="flex space-x-6">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer"
                onClick={() => {
                  // Handle privacy policy action
                  alert('Privacy Policy - This feature will be implemented soon.');
                }}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer"
                onClick={() => {
                  // Handle terms of service action
                  alert('Terms of Service - This feature will be implemented soon.');
                }}
              >
                Terms of Service
              </button>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer"
                onClick={() => {
                  // Handle contact action
                  alert('Contact - This feature will be implemented soon.');
                }}
              >
                Contact
              </button>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};
