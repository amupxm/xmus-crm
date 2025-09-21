"use client";
import {
  MutationFunction,
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authAPI } from "../services/api";
import useAuthStore from "../stores/authStore";

const authExpiryKey = "profile" as const;

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();

  const getMeMutation = useMutation({
    mutationFn: authAPI.getMe,
    onSuccess: async (data) => {
      setAuth(data);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (data) => {
      setAuth(data);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Clear all cached data
    },
    onSettled: () => {
      // Always clear auth even if logout request fails
      clearAuth();
      queryClient.clear();
    },
  });

  return {
    // State
    user,
    isAuthenticated,

    // Mutations
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    getMe: getMeMutation.mutateAsync,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isGettingMe: getMeMutation.isPending,
    // Error states
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    getMeError: getMeMutation.error,
    // Utils
  };
};

// Hook for other API calls that need auth
export const useAuthenticatedQuery = <Response>(
  queryKey: string,
  queryFn: QueryFunction<Response, string[]>,
  options = {},
) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [queryKey],
    queryFn: queryFn,
    enabled: isAuthenticated,
    ...options,
  });
};

export const useAuthenticatedMutation = (
  mutationFn: MutationFunction<unknown, void>,
  options = {},
) => {
  return useMutation({
    mutationFn: mutationFn,
    ...options,
  });
};
