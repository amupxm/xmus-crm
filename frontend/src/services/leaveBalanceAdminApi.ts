import apiClient from './api';

export interface UserLeaveBalance {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  balances: LeaveBalance[];
}

export interface LeaveBalance {
  id: number;
  user_id: number;
  leave_type: string;
  year: number;
  total_allocated: number;
  used_days: number;
  remaining_days: number;
  carry_over_days: number;
}

export interface UpdateLeaveBalanceData {
  user_id: number;
  leave_type: string;
  total_allocated: number;
  carry_over_days: number;
}

export interface BulkUpdateLeaveBalanceData {
  user_id: number;
  leave_balances: {
    leave_type: string;
    total_allocated: number;
    carry_over_days: number;
  }[];
}

export interface LeaveBalanceStats {
  [leaveType: string]: {
    total_allocated: number;
    total_used: number;
    total_remaining: number;
    total_carryover: number;
  };
}

export const leaveBalanceAdminApi = {
  // Get all users' leave balances
  getAllUsersLeaveBalances: async (year?: number): Promise<{ year: number; data: UserLeaveBalance[] }> => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/admin/leave-balances', { params });
    return response.data;
  },

  // Get specific user's leave balances
  getUserLeaveBalances: async (userId: number, year?: number): Promise<{ user: any; year: number; balances: LeaveBalance[] }> => {
    const params = year ? { year } : {};
    const response = await apiClient.get(`/admin/leave-balances/user/${userId}`, { params });
    return response.data;
  },

  // Update specific leave balance for a user
  updateUserLeaveBalance: async (userId: number, data: Omit<UpdateLeaveBalanceData, 'user_id'>, year?: number): Promise<{ message: string; balance: LeaveBalance }> => {
    const params = year ? { year } : {};
    const response = await apiClient.put(`/admin/leave-balances/user/${userId}`, {
      user_id: userId,
      ...data
    }, { params });
    return response.data;
  },

  // Bulk update leave balances for a user
  bulkUpdateUserLeaveBalances: async (userId: number, data: Omit<BulkUpdateLeaveBalanceData, 'user_id'>, year?: number): Promise<{ message: string; balances: LeaveBalance[] }> => {
    const params = year ? { year } : {};
    const response = await apiClient.put(`/admin/leave-balances/user/${userId}/bulk`, {
      user_id: userId,
      ...data
    }, { params });
    return response.data;
  },

  // Reset user's leave balances for new year
  resetUserLeaveBalances: async (userId: number, year?: number): Promise<{ message: string; balances: LeaveBalance[] }> => {
    const params = year ? { year } : {};
    const response = await apiClient.post(`/admin/leave-balances/user/${userId}/reset`, {}, { params });
    return response.data;
  },

  // Get leave balance statistics
  getLeaveBalanceStats: async (year?: number): Promise<{ year: number; stats: LeaveBalanceStats }> => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/admin/leave-balances/stats', { params });
    return response.data;
  },
};
