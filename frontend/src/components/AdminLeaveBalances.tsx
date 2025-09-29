import React, { useEffect, useState } from 'react';
import { LeaveBalance, leaveBalanceAdminApi, UserLeaveBalance } from '../services/leaveBalanceAdminApi';
import { LEAVE_TYPES } from '../services/leaveRequestsApi';
import { useLeaveNotifications } from './NotificationSystem';

export const AdminLeaveBalances: React.FC = () => {
  const [users, setUsers] = useState<UserLeaveBalance[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserLeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [editingBalances, setEditingBalances] = useState<{ [key: string]: LeaveBalance }>({});
  const [saving, setSaving] = useState(false);
  const { notifyError } = useLeaveNotifications();

  useEffect(() => {
    loadUsers();
  }, [currentYear]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveBalanceAdminApi.getAllUsersLeaveBalances(currentYear);
      setUsers(data.data);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBalance = (user: UserLeaveBalance, balance: LeaveBalance) => {
    setSelectedUser(user);
    setEditingBalances({
      [balance.leave_type]: { ...balance }
    });
  };

  const handleBulkEdit = (user: UserLeaveBalance) => {
    setSelectedUser(user);
    const balancesMap: { [key: string]: LeaveBalance } = {};
    user.balances.forEach(balance => {
      balancesMap[balance.leave_type] = { ...balance };
    });
    setEditingBalances(balancesMap);
  };

  const handleBalanceChange = (leaveType: string, field: keyof LeaveBalance, value: number) => {
    setEditingBalances(prev => ({
      ...prev,
      [leaveType]: {
        ...prev[leaveType],
        [field]: value,
        remaining_days: field === 'total_allocated' || field === 'carry_over_days' 
          ? (field === 'total_allocated' ? value : prev[leaveType].total_allocated) + 
            (field === 'carry_over_days' ? value : prev[leaveType].carry_over_days) - 
            prev[leaveType].used_days
          : prev[leaveType].remaining_days
      }
    }));
  };

  const handleSaveBalances = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      
      const balancesArray = Object.values(editingBalances);
      await leaveBalanceAdminApi.bulkUpdateUserLeaveBalances(selectedUser.user.id, {
        leave_balances: balancesArray.map(balance => ({
          leave_type: balance.leave_type,
          total_allocated: balance.total_allocated,
          carry_over_days: balance.carry_over_days
        }))
      }, currentYear);

      // Refresh data
      await loadUsers();
      setSelectedUser(null);
      setEditingBalances({});
    } catch (err: any) {
      notifyError(err.response?.data?.error || 'Failed to update leave balances');
    } finally {
      setSaving(false);
    }
  };

  const handleResetBalances = async (userId: number) => {
    if (!window.confirm('Are you sure you want to reset this user\'s leave balances for the new year?')) {
      return;
    }

    try {
      setSaving(true);
      await leaveBalanceAdminApi.resetUserLeaveBalances(userId, currentYear);
      await loadUsers();
    } catch (err: any) {
      notifyError(err.response?.data?.error || 'Failed to reset leave balances');
    } finally {
      setSaving(false);
    }
  };

  const getLeaveTypeName = (leaveType: string) => {
    return LEAVE_TYPES[leaveType as keyof typeof LEAVE_TYPES] || leaveType;
  };

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
              onClick={loadUsers}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Leave Balance Management</h1>
          <p className="text-gray-400 mt-2">Manage leave allocations for all users</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.map((userData) => (
          <div key={userData.user.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {userData.user.first_name} {userData.user.last_name}
                </h3>
                <p className="text-gray-400 text-sm">{userData.user.email}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkEdit(userData)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  Edit All
                </button>
                <button
                  onClick={() => handleResetBalances(userData.user.id)}
                  disabled={saving}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-md text-sm"
                >
                  Reset Year
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.balances.map((balance) => (
                <div key={balance.leave_type} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-white">
                      {getLeaveTypeName(balance.leave_type)}
                    </h4>
                    <button
                      onClick={() => handleEditBalance(userData, balance)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Allocated:</span>
                      <span className="text-white">{balance.total_allocated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Used:</span>
                      <span className="text-white">{balance.used_days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Remaining:</span>
                      <span className="text-green-400 font-semibold">{balance.remaining_days}</span>
                    </div>
                    {balance.carry_over_days > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Carry-over:</span>
                        <span className="text-blue-400">{balance.carry_over_days}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-white">
                Edit Leave Balances - {selectedUser.user.first_name} {selectedUser.user.last_name}
              </h3>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditingBalances({});
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {Object.values(editingBalances).map((balance) => (
                <div key={balance.leave_type} className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">
                    {getLeaveTypeName(balance.leave_type)}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total Allocated
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={balance.total_allocated}
                        onChange={(e) => handleBalanceChange(balance.leave_type, 'total_allocated', parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Carry-over Days
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={balance.carry_over_days}
                        onChange={(e) => handleBalanceChange(balance.leave_type, 'carry_over_days', parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Remaining Days
                      </label>
                      <input
                        type="number"
                        value={balance.remaining_days}
                        disabled
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-400">
                    Used: {balance.used_days} days
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditingBalances({});
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBalances}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
