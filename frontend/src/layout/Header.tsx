import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from '@heroui/react';
import { LogOut, Menu } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthApi } from '../hooks/useAuthApi';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logoutUser, isAuthenticated } = useAuthApi();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="glass-dark border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center neon-glow">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-xl font-bold gradient-text">
              XMUS CRM
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <User
                  as="button"
                  avatarProps={{
                    isBordered: true,
                    src: `https://ui-avatars.com/api/?name=${user.email}&background=667eea&color=fff`,
                    className: "transition-transform",
                  }}
                  className="transition-transform"
                  description={user.email}
                  name={user.email}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user.email}</p>
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  color="danger"
                  className="text-danger"
                  onPress={handleLogout}
                  startContent={<LogOut className="w-4 h-4" />}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : null}
        </div>
      </div>
    </header>
  );
};
