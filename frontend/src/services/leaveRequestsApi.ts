import apiClient from './api';

export interface LeaveRequest {
  id: number;
  user_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: string;
  team_lead_id?: number;
  team_lead_approved_at?: string;
  team_lead_comments?: string;
  hr_approved_at?: string;
  hr_comments?: string;
  management_approved_at?: string;
  management_comments?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  team_lead?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
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

export interface CreateLeaveRequestData {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface UpdateLeaveRequestData {
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
}

export interface ApprovalData {
  comments?: string;
}

export interface LeaveCalendarEntry {
  id: number;
  leave_request_id: number;
  user_id: number;
  leave_type: string;
  date: string;
  is_half_day: boolean;
  is_morning: boolean;
  status: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface LeaveStats {
  [key: string]: number;
}

export interface WorkflowStatus {
  current_status: string;
  next_approver?: string;
  is_final: boolean;
  requires_management: boolean;
}

export interface TimelineEntry {
  action: string;
  timestamp: string;
  user_id: number;
  user_name: string;
  comments: string;
  level?: string;
}

export interface LeaveSummary {
  year: number;
  total_requests: number;
  by_status: { [key: string]: number };
  by_type: { [key: string]: number };
  by_month: { [key: string]: number };
}

export const leaveRequestsApi = {
  // Leave request management
  createLeaveRequest: async (data: CreateLeaveRequestData): Promise<LeaveRequest> => {
    const response = await apiClient.post('/leave-requests', data);
    return response.data.data;
  },

  getLeaveRequests: async (year?: number): Promise<LeaveRequest[]> => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/leave-requests', { params });
    return response.data.data;
  },

  getLeaveRequest: async (id: number): Promise<LeaveRequest> => {
    const response = await apiClient.get(`/leave-requests/${id}`);
    return response.data.data;
  },

  updateLeaveRequest: async (id: number, data: UpdateLeaveRequestData): Promise<LeaveRequest> => {
    const response = await apiClient.put(`/leave-requests/${id}`, data);
    return response.data.data;
  },

  cancelLeaveRequest: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-requests/${id}`);
  },

  // Leave balance and statistics
  getLeaveBalance: async (year?: number): Promise<LeaveBalance[]> => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/leave-requests/balance', { params });
    return response.data.data;
  },

  getLeaveStats: async (): Promise<LeaveStats> => {
    const response = await apiClient.get('/leave-requests/stats');
    return response.data.data;
  },

  getLeaveCalendar: async (year: number): Promise<LeaveCalendarEntry[]> => {
    const response = await apiClient.get(`/leave-requests/calendar/${year}`);
    return response.data.data;
  },

  // Approval workflow
  getPendingApprovals: async (type: 'team-lead' | 'hr' | 'management'): Promise<LeaveRequest[]> => {
    const response = await apiClient.get('/leave-requests/pending', { params: { type } });
    return response.data.data;
  },

  approveLeaveRequest: async (id: number, data: ApprovalData): Promise<LeaveRequest> => {
    const response = await apiClient.post(`/leave-requests/${id}/approve`, data);
    return response.data.data;
  },

  rejectLeaveRequest: async (id: number, data: ApprovalData): Promise<void> => {
    await apiClient.post(`/leave-requests/${id}/reject`, data);
  },

  // Workflow status and timeline
  getWorkflowStatus: async (id: number): Promise<WorkflowStatus> => {
    const response = await apiClient.get(`/leave-requests/${id}/workflow`);
    return response.data.data;
  },

  getTimeline: async (id: number): Promise<TimelineEntry[]> => {
    const response = await apiClient.get(`/leave-requests/${id}/timeline`);
    return response.data.data;
  },

  // Reporting
  getSummary: async (year?: number): Promise<LeaveSummary> => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/leave-requests/summary', { params });
    return response.data.data;
  },
};

export const LEAVE_TYPES = {
  ANNUAL: 'Annual Leave',
  SICK: 'Sick Leave',
  PERSONAL: 'Personal Leave',
  EMERGENCY: 'Emergency Leave',
  MATERNITY: 'Maternity Leave',
  PATERNITY: 'Paternity Leave',
  UNPAID: 'Unpaid Leave',
} as const;

export const LEAVE_STATUSES = {
  PENDING: 'Pending',
  TEAM_LEAD_APPROVED: 'Team Lead Approved',
  HR_APPROVED: 'HR Approved',
  MANAGEMENT_APPROVED: 'Management Approved',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
} as const;

export const LEAVE_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  TEAM_LEAD_APPROVED: 'bg-blue-100 text-blue-800',
  HR_APPROVED: 'bg-purple-100 text-purple-800',
  MANAGEMENT_APPROVED: 'bg-indigo-100 text-indigo-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
} as const;
