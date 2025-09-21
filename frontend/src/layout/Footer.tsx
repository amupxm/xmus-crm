import { Button } from '@heroui/react';
import { FileText, Mail, Shield } from 'lucide-react';
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-dark border-t border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center neon-glow">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <span className="text-sm text-gray-400">
              © 2024 XMUS CRM. All rights reserved.
            </span>
          </div>
          
          <div className="mt-4 md:mt-0">
            <nav className="flex flex-wrap gap-4">
              <Button
                variant="light"
                size="sm"
                className="text-gray-400 hover:text-white transition-colors bg-transparent"
                startContent={<Shield className="w-4 h-4" />}
                onPress={() => {
                  alert('Privacy Policy - This feature will be implemented soon.');
                }}
              >
                Privacy Policy
              </Button>
              <Button
                variant="light"
                size="sm"
                className="text-gray-400 hover:text-white transition-colors bg-transparent"
                startContent={<FileText className="w-4 h-4" />}
                onPress={() => {
                  alert('Terms of Service - This feature will be implemented soon.');
                }}
              >
                Terms of Service
              </Button>
              <Button
                variant="light"
                size="sm"
                className="text-gray-400 hover:text-white transition-colors bg-transparent"
                startContent={<Mail className="w-4 h-4" />}
                onPress={() => {
                  alert('Contact - This feature will be implemented soon.');
                }}
              >
                Contact
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};
