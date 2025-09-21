import { ILeaveRequest, IYearlyHolidays } from "@internal-cms/shared/src/api/leaves";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveAPI } from "../services/api";

export const useLeave = () => {
    const queryClient = useQueryClient();

    // Create leave request mutation
    const createLeaveMutation = useMutation({
        mutationFn: leaveAPI.addNew,
        onSuccess: async (data) => {
            // Invalidate relevant queries after successful leave creation
            await queryClient.invalidateQueries({ queryKey: ["leaves"] });
        },
        onError: (error) => {
            console.error("Leave request failed:", error);
        },
    });

    const getAllLeaveRequests = useMutation<ILeaveRequest[]>({
        mutationFn: leaveAPI.getRequests,
        onSuccess: async (data) => {
            // Invalidate relevant queries after successful leave requests retrieval
            await queryClient.invalidateQueries({ queryKey: ["leaves"] });
        },
        onError: (error) => {
            console.error("Failed to retrieve leave requests:", error);
        },
    });

    const getYearlyHolidays = useMutation<IYearlyHolidays>({
        mutationFn: leaveAPI.getYearlyHolidays,
        onSuccess: async (data) => {
            // Invalidate relevant queries after successful yearly holidays retrieval
            await queryClient.invalidateQueries({ queryKey: ["yearlyHolidays"] });
        },
        onError: (error) => {
            console.error("Failed to retrieve yearly holidays:", error);
        }
    })
    return {
        // Mutations
        createLeave: createLeaveMutation.mutateAsync,
        createLeaveMutate: createLeaveMutation.mutate, // Non-async version
        getAllLeaveRequests: getAllLeaveRequests.mutateAsync,
        getYearlyHolidays: getYearlyHolidays.mutateAsync, // Non-async version
        // Loading states
        isCreatingLeave: createLeaveMutation.isPending,
        isGettingLeaveRequests: getAllLeaveRequests.isPending,
        isGettingYearlyHolidays: getYearlyHolidays.isPending,
        // Error states
        createLeaveError: createLeaveMutation.error,
        getAllLeaveRequestsError: getAllLeaveRequests.error,
        getYearlyHolidaysError: getYearlyHolidays.error,
        // Success state
        isCreateLeaveSuccess: createLeaveMutation.isSuccess,
        isGetAllLeaveRequestsSuccess: getAllLeaveRequests.isSuccess,
        isGetYearlyHolidaysSuccess: getYearlyHolidays.isSuccess,
        // Reset mutation state
        resetCreateLeave: createLeaveMutation.reset,
    };
};