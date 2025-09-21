// app/login/layout.tsx
import "@/styles/globals.css";
import clsx from "clsx";

import { Providers } from "../providers";

import { fontSans } from "@/config/fonts";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "min-h-screen text-foreground bg-background font-sans antialiased",
        fontSans.variable,
      )}
    >
      <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
        {/* No Navbar here */}
        <main className="flex items-center justify-center min-h-screen">
          {children}
        </main>
      </Providers>
    </div>
  );
}
