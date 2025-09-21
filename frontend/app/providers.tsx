"use client";

import type { ThemeProviderProps } from "next-themes";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@heroui/toast";

import useAuthStore from "@/stores/authStore";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const { isAuthenticated, initializeAuth } = useAuthStore();

  // Initialize auth state on app load
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <HeroUIProvider navigate={router.push}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider />
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </QueryClientProvider>
    </HeroUIProvider>
  );
}
