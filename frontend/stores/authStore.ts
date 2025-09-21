import {
  AuthResponse,
} from "@internal-cms/shared/src/api/auth";
import { IUserResponseFull } from "@internal-cms/shared/src/api/user";
import { create } from "zustand";

interface AuthStateStructure {
  user: IUserResponseFull | null;
  isAuthenticated: boolean;
  setAuth: (authResponse: AuthResponse) => void;
  clearAuth: () => void;
  updateUser: (userData: IUserResponseFull) => void;
  initializeAuth: () => void;
  getUser: () => IUserResponseFull | null;
}

const isServer = typeof window === "undefined";

// Helper to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof window !== "undefined") {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Helper to set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window !== "undefined") {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; secure; samesite=strict`;
  }
};

// Helper to remove cookie
const removeCookie = (name: string) => {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

const useAuthStore = create<AuthStateStructure>((set, get) => {
  if (isServer) {
    // return a stub during SSR
    return {
      user: null,
      isAuthenticated: false,
      setAuth: () => { },
      clearAuth: () => { },
      updateUser: () => { },
      initializeAuth: () => { },
      getUser: () => null,
    };
  }

  return {
    // State
    user: null,
    isAuthenticated: false,

    // Actions
    setAuth: (authResponse: AuthResponse) => {
      const { user } = authResponse;

      // Store user data in a cookie (base64 encoded)
      const jsonUser = JSON.stringify(user);
      setCookie("user", btoa(jsonUser), 7); // Store for 7 days

      set({
        user,
        isAuthenticated: true,
      });
    },

    getUser(): IUserResponseFull | null {
      const { user } = get();
      return user;
    },

    clearAuth: () => {
      // Clear cookies
      removeCookie("user");
      removeCookie("accessToken");
      removeCookie("refreshToken");

      // Clear state
      set({
        user: null,
        isAuthenticated: false,
      });
    },

    updateUser: (userData: IUserResponseFull) => {
      // Update both state and cookie
      const jsonUser = JSON.stringify(userData);
      setCookie("user", btoa(jsonUser), 7);

      set({ user: userData });
    },

    // Initialize auth state from cookies
    initializeAuth: () => {
      if (typeof window !== "undefined") {
        const userCookie = getCookie("user");
        const accessToken = getCookie("accessToken");
        const refreshToken = getCookie("refreshToken");

        try {
          // Check if we have either token and user data
          if (userCookie && (accessToken || refreshToken)) {
            const user = JSON.parse(atob(userCookie));
            set({
              user,
              isAuthenticated: true,
            });
          } else {
            // If we don't have complete auth data, clear everything
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error("Failed to parse user from cookie:", error);

          // Clear cookies and state on parse error
          removeCookie("user");
          removeCookie("accessToken");
          removeCookie("refreshToken");

          set({
            user: null,
            isAuthenticated: false,
          });
        }
      }
    },
  };
});

export default useAuthStore;