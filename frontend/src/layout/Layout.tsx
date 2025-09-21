import React, { useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const renderLayout = () => {
    switch (layoutType) {
      case 'minimal':
        return (
          <div className="min-h-screen bg-gradient-cyber">
            <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="min-h-screen bg-gradient-cyber flex">
            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
            <div className="flex-1 flex flex-col md:ml-64">
              <Header onMenuToggle={handleMenuToggle} />
              <main className="flex-1 p-6">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="min-h-screen bg-gradient-cyber">
            <Header onMenuToggle={handleMenuToggle} />
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
