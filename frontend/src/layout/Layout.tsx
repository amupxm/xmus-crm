import React from 'react';
import { LayoutType } from '../types';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface LayoutProps {
  children: React.ReactNode;
  layoutType?: LayoutType;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  layoutType = 'default' 
}) => {
  const renderLayout = () => {
    switch (layoutType) {
      case 'minimal':
        return (
          <div className="min-h-screen bg-gray-50">
            <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        );
    }
  };

  return renderLayout();
};
