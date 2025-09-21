import { requestAPI } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRequest = () => {
    const queryClient = useQueryClient();

    const getAllRequests = useMutation({
        mutationFn: requestAPI.getAll,
        onSuccess: async (data) => {
            // Invalidate relevant queries after successful request retrieval
            await queryClient.invalidateQueries({ queryKey: ["requests"] });
        },
        onError: (error) => {
            console.error("Failed to retrieve requests:", error);
        }
    })
    return {
        // Mutations
        getAllRequests: getAllRequests.mutateAsync,

        // Loading states
        isGettingAllRequests: getAllRequests.isPending,

        // Error states
        getAllRequestsError: getAllRequests.error,

        // Success state
        isGetAllRequestsSuccess: getAllRequests.isSuccess,

    }


}