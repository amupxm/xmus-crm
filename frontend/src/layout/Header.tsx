import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, User } from '@heroui/react';
import { Home, Info, LogOut } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthApi } from '../hooks/useAuthApi';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, logoutUser, isAuthenticated } = useAuthApi();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/about", icon: Info },
  ];

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen}
      className="glass-dark border-b border-gray-700"
      maxWidth="full"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-white"
        />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center neon-glow">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-xl font-bold gradient-text">
              XMUS CRM
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {isAuthenticated && (
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.name} isActive={isActive(item.href)}>
              <Link
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
      )}

      <NavbarContent justify="end">
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
      </NavbarContent>

      <NavbarMenu className="glass-dark">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              to={item.href}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};
