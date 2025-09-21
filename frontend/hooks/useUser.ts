import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../services/api";

import useAuthStore from "@/stores/authStore";
import { IUserResponseForDashboard } from "@internal-cms/shared/src/api/user";

export const useUser = () => {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();

  const getAllUsersMutation = useMutation<IUserResponseForDashboard[]>({
    mutationFn: userAPI.getAllUsers,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Failed to fetch users:", error);
    },
  })

  return {
    getAllUsers: getAllUsersMutation.mutateAsync,
    isGettingAllUsers: getAllUsersMutation.isPending,
    getAllUsersError: getAllUsersMutation.error,
  }

};
