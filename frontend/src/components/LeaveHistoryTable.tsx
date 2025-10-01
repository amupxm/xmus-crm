import React, { useState } from 'react';
import { LEAVE_STATUSES, LEAVE_STATUS_COLORS, LEAVE_TYPES, LeaveRequest, leaveRequestsApi } from '../services/leaveRequestsApi';
import { ApprovalLevelDisplay } from './ApprovalLevelDisplay';

interface LeaveHistoryTableProps {
  requests: LeaveRequest[];
  onRequestUpdated: (request: LeaveRequest) => void;
  onRequestCancelled: (requestId: number) => void;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({ 
  requests, 
  onRequestUpdated, 
  onRequestCancelled 
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<LeaveRequest>>({});
  const [loading, setLoading] = useState<number | null>(null);
  const [showingApprovalLevels, setShowingApprovalLevels] = useState<number | null>(null);

  const canEdit = (request: LeaveRequest) => {
    return request.status === 'PENDING';
  };

  const canCancel = (request: LeaveRequest) => {
    return request.status === 'PENDING' || request.status === 'TEAM_LEAD_APPROVED';
  };

  const handleEdit = (request: LeaveRequest) => {
    setEditingId(request.id);
    setEditingData({
      leave_type: request.leave_type,
      start_date: request.start_date.split('T')[0],
      end_date: request.end_date.split('T')[0],
      reason: request.reason,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSaveEdit = async (id: number) => {
    try {
      setLoading(id);
      const updatedRequest = await leaveRequestsApi.updateLeaveRequest(id, editingData);
      onRequestUpdated(updatedRequest);
      setEditingId(null);
      setEditingData({});
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        setLoading(id);
        await leaveRequestsApi.cancelLeaveRequest(id);
        onRequestCancelled(id);
      } catch (error) {
        console.error('Failed to cancel request:', error);
      } finally {
        setLoading(null);
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

  if (requests.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 text-center">
        <div className="text-gray-400 text-lg mb-2">📋</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Leave Requests</h3>
        <p className="text-gray-400">You haven't submitted any leave requests yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">My Leave Requests</h3>
        <p className="text-gray-400 text-sm mt-1">
          {requests.length} request{requests.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Workflow
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-700/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    {LEAVE_TYPES[request.leave_type as keyof typeof LEAVE_TYPES] || request.leave_type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300 max-w-xs truncate">
                    {request.reason || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {editingId === request.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(request.id)}
                          disabled={loading === request.id}
                          className="text-green-400 hover:text-green-300 disabled:opacity-50"
                        >
                          {loading === request.id ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {canEdit(request) && (
                          <button
                            onClick={() => handleEdit(request)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                        )}
                        {canCancel(request) && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            disabled={loading === request.id}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            {loading === request.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setShowingApprovalLevels(request.id)}
                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                  >
                    <span>📊</span>
                    <span>View Workflow</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Leave Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Leave Type
                </label>
                <select
                  value={editingData.leave_type || ''}
                  onChange={(e) => setEditingData(prev => ({ ...prev, leave_type: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal Leave</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingData.start_date || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editingData.end_date || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={editingData.reason || ''}
                  onChange={(e) => setEditingData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingId)}
                disabled={loading === editingId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md"
              >
                {loading === editingId ? 'Saving...' : 'Save Changes'}
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
