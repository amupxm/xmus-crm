import React, { useEffect, useState } from 'react';
import { LEAVE_STATUSES, LEAVE_STATUS_COLORS, LEAVE_TYPES, LeaveRequest, leaveRequestsApi } from '../services/leaveRequestsApi';
import { ApprovalLevelDisplay } from './ApprovalLevelDisplay';

interface ApprovalDashboardProps {
  onRequestUpdated: (request: LeaveRequest) => void;
}

export const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({ onRequestUpdated }) => {
  const [activeTab, setActiveTab] = useState<'team-lead' | 'hr' | 'management'>('team-lead');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);
  const [showingApprovalLevels, setShowingApprovalLevels] = useState<number | null>(null);

  useEffect(() => {
    loadPendingRequests();
  }, [activeTab]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveRequestsApi.getPendingApprovals(activeTab);
      setRequests(data);
    } catch (err) {
      setError('Failed to load pending requests');
      console.error('Error loading pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: LeaveRequest) => {
    if (window.confirm(`Are you sure you want to approve this leave request?`)) {
      try {
        setProcessing(request.id);
        const updatedRequest = await leaveRequestsApi.approveLeaveRequest(request.id, {
          comments: approvalComments
        });
        onRequestUpdated(updatedRequest);
        setSelectedRequest(null);
        setApprovalComments('');
        loadPendingRequests();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to approve request');
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleReject = async (request: LeaveRequest) => {
    if (window.confirm(`Are you sure you want to reject this leave request?`)) {
      try {
        setProcessing(request.id);
        await leaveRequestsApi.rejectLeaveRequest(request.id, {
          comments: approvalComments
        });
        onRequestUpdated({ ...request, status: 'REJECTED' });
        setSelectedRequest(null);
        setApprovalComments('');
        loadPendingRequests();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to reject request');
      } finally {
        setProcessing(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusKey = status as keyof typeof LEAVE_STATUS_COLORS;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        LEAVE_STATUS_COLORS[statusKey] || 'bg-gray-100 text-gray-800'
      }`}>
        {LEAVE_STATUSES[statusKey as keyof typeof LEAVE_STATUSES] || status}
      </span>
    );
  };

  const tabs = [
    { id: 'team-lead', label: 'Team Lead Approvals', count: 0 },
    { id: 'hr', label: 'HR Approvals', count: 0 },
    { id: 'management', label: 'Management Approvals', count: 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-400 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-red-400 font-semibold">Error Loading Data</h3>
            <p className="text-red-300 mt-1">{error}</p>
            <button 
              onClick={loadPendingRequests}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Approval Dashboard</h2>
        <p className="text-gray-400 mt-2">Review and approve leave requests</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {requests.length > 0 && (
                <span className="ml-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 text-center">
            <div className="text-gray-400 text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Pending Requests</h3>
            <p className="text-gray-400">
              There are no pending {activeTab.replace('-', ' ')} requests at the moment.
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {LEAVE_TYPES[request.leave_type as keyof typeof LEAVE_TYPES]} Request
                  </h3>
                  <p className="text-gray-400 text-sm">
                    by {request.user?.first_name} {request.user?.last_name}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(request.status)}
                  <button
                    onClick={() => setShowingApprovalLevels(request.id)}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    📊 Workflow
                  </button>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-gray-400 text-sm">Duration</span>
                  <p className="text-white font-medium">
                    {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Start Date</span>
                  <p className="text-white font-medium">{formatDate(request.start_date)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">End Date</span>
                  <p className="text-white font-medium">{formatDate(request.end_date)}</p>
                </div>
              </div>

              {request.reason && (
                <div className="mb-4">
                  <span className="text-gray-400 text-sm">Reason</span>
                  <p className="text-white mt-1">{request.reason}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleReject(request)}
                  disabled={processing === request.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-md text-sm"
                >
                  {processing === request.id ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(request)}
                  disabled={processing === request.id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-md text-sm"
                >
                  {processing === request.id ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-white">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Employee</span>
                  <p className="text-white font-medium">
                    {selectedRequest.user?.first_name} {selectedRequest.user?.last_name}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Leave Type</span>
                  <p className="text-white font-medium">
                    {LEAVE_TYPES[selectedRequest.leave_type as keyof typeof LEAVE_TYPES]}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Duration</span>
                  <p className="text-white font-medium">
                    {selectedRequest.days_requested} day{selectedRequest.days_requested !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Start Date</span>
                  <p className="text-white font-medium">{formatDate(selectedRequest.start_date)}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">End Date</span>
                  <p className="text-white font-medium">{formatDate(selectedRequest.end_date)}</p>
                </div>
              </div>

              {selectedRequest.reason && (
                <div>
                  <span className="text-gray-400 text-sm">Reason</span>
                  <p className="text-white mt-1 p-3 bg-gray-700 rounded-md">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your comments here..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                Close
              </button>
              <button
                onClick={() => handleReject(selectedRequest)}
                disabled={processing === selectedRequest.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-md"
              >
                {processing === selectedRequest.id ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedRequest)}
                disabled={processing === selectedRequest.id}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-md"
              >
                {processing === selectedRequest.id ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Level Modal */}
      {showingApprovalLevels && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ApprovalLevelDisplay
              requestId={showingApprovalLevels}
              onClose={() => setShowingApprovalLevels(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
