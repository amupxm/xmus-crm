import { Button } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import React from 'react';
import { useTheme } from '../providers';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      isIconOnly
      variant="light"
      className="text-gray-400 hover:text-white transition-colors"
      onPress={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
};
