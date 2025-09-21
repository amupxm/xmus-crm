"use client";

import { HeroUIProvider } from "@heroui/react";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ProvidersProps {
  children: ReactNode;
  themeProps?: {
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
  };
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const [theme, setTheme] = useState(themeProps?.defaultTheme || 'dark');

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </ThemeContext.Provider>
  );
}
