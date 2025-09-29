import React, { useState } from 'react';
import { CreateLeaveRequestData, LEAVE_TYPES, LeaveBalance, leaveRequestsApi } from '../services/leaveRequestsApi';
import { useLeaveNotifications } from './NotificationSystem';

interface LeaveRequestFormProps {
  onRequestCreated: (request: any) => void;
  leaveBalance: LeaveBalance[];
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onRequestCreated, leaveBalance }) => {
  const [formData, setFormData] = useState<CreateLeaveRequestData>({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { notifyLeaveRequestCreated, notifyInsufficientBalance, notifyError } = useLeaveNotifications();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const getAvailableLeaveTypes = () => {
    return leaveBalance.filter(balance => balance.remaining_days > 0);
  };

  const getRemainingDays = (leaveType: string) => {
    const balance = leaveBalance.find(b => b.leave_type === leaveType);
    return balance ? balance.remaining_days : 0;
  };

  const validateForm = () => {
    if (!formData.leave_type) {
      setError('Please select a leave type');
      return false;
    }
    if (!formData.start_date) {
      setError('Please select a start date');
      return false;
    }
    if (!formData.end_date) {
      setError('Please select an end date');
      return false;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('End date must be after start date');
      return false;
    }
    if (new Date(formData.start_date) < new Date()) {
      setError('Start date cannot be in the past');
      return false;
    }
    
    const daysRequested = calculateDays();
    const remainingDays = getRemainingDays(formData.leave_type);
    if (daysRequested > remainingDays) {
      const leaveTypeName = LEAVE_TYPES[formData.leave_type as keyof typeof LEAVE_TYPES] || formData.leave_type;
      notifyInsufficientBalance(leaveTypeName, remainingDays);
      setError(`Insufficient leave balance. You have ${remainingDays} days remaining.`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const newRequest = await leaveRequestsApi.createLeaveRequest(formData);
      onRequestCreated(newRequest);
      setSuccess(true);
      notifyLeaveRequestCreated();
      setFormData({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create leave request';
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const availableLeaveTypes = getAvailableLeaveTypes();
  const daysRequested = calculateDays();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Request Leave</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-md">
            <div className="flex items-center">
              <div className="text-red-400 text-xl mr-3">⚠️</div>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-500/50 rounded-md">
            <div className="flex items-center">
              <div className="text-green-400 text-xl mr-3">✅</div>
              <p className="text-green-300">Leave request created successfully!</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="leave_type" className="block text-sm font-medium text-gray-300 mb-2">
              Leave Type *
            </label>
            <select
              id="leave_type"
              name="leave_type"
              value={formData.leave_type}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select leave type</option>
              {availableLeaveTypes.map((balance) => (
                <option key={balance.leave_type} value={balance.leave_type}>
                  {LEAVE_TYPES[balance.leave_type as keyof typeof LEAVE_TYPES]} 
                  ({balance.remaining_days} days remaining)
                </option>
              ))}
            </select>
            {availableLeaveTypes.length === 0 && (
              <p className="mt-2 text-sm text-yellow-400">
                No leave balance available. Please contact HR.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {daysRequested > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-md p-4">
              <div className="flex items-center">
                <div className="text-blue-400 text-xl mr-3">ℹ️</div>
                <div>
                  <p className="text-blue-300 font-medium">
                    You are requesting {daysRequested} day{daysRequested > 1 ? 's' : ''} of leave
                  </p>
                  {formData.leave_type && (
                    <p className="text-blue-200 text-sm mt-1">
                      Remaining balance: {getRemainingDays(formData.leave_type)} days
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
              Reason (Optional)
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide a reason for your leave request..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setFormData({
                leave_type: '',
                start_date: '',
                end_date: '',
                reason: '',
              })}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || availableLeaveTypes.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              {loading ? 'Creating...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
