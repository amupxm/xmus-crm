import clsx from 'clsx';
import React from 'react';
import { fontSans } from '../config/fonts';
import { Providers } from '../providers';

interface LoginLayoutProps {
  children: React.ReactNode;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <div
      className={clsx(
        "min-h-screen text-foreground bg-background font-sans antialiased",
        fontSans.variable,
      )}
    >
      <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        {/* No Navbar here */}
        <main className="flex items-center justify-center min-h-screen">
          {children}
        </main>
      </Providers>
    </div>
  );
};
