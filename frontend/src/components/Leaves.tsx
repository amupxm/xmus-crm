import React, { useEffect, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { LEAVE_STATUSES, LEAVE_STATUS_COLORS, LEAVE_TYPES, LeaveBalance, LeaveRequest, leaveRequestsApi } from '../services/leaveRequestsApi';
import { AdminLeaveBalances } from './AdminLeaveBalances';
import { ApprovalDashboard } from './ApprovalDashboard';
import { LeaveBalanceCard } from './LeaveBalanceCard';
import { LeaveCalendar } from './LeaveCalendar';
import { LeaveHistoryTable } from './LeaveHistoryTable';
import { LeaveRequestForm } from './LeaveRequestForm';
import { RoleBasedAccess } from './RoleBasedAccess';

export const Leaves: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'history' | 'calendar' | 'approvals' | 'admin'>('overview');
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { user } = useUser();

  useEffect(() => {
    loadData();
  }, [currentYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [balanceData, requestsData] = await Promise.all([
        leaveRequestsApi.getLeaveBalance(currentYear),
        leaveRequestsApi.getLeaveRequests(currentYear)
      ]);
      
      setLeaveBalance(balanceData);
      setLeaveRequests(requestsData);
      console.log(requestsData);
    } catch (err) {
      setError('Failed to load leave data');
      console.error('Error loading leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRequestCreated = (newRequest: LeaveRequest) => {
    setLeaveRequests(prev => [newRequest, ...prev]);
    loadData(); // Refresh balance
  };

  const handleLeaveRequestUpdated = (updatedRequest: LeaveRequest) => {
    setLeaveRequests(prev => 
      prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
    );
    loadData(); // Refresh balance
  };

  const handleLeaveRequestCancelled = (requestId: number) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'CANCELLED' }
          : req
      )
    );
    loadData(); // Refresh balance
  };

  const hasAdminAccess = user?.roles?.some(role => 
    ['admin', 'hr'].includes(role.name.toLowerCase())
  ) || false;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'request', label: 'Request Leave', icon: '➕' },
    { id: 'history', label: 'My Requests', icon: '📋' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'approvals', label: 'Approvals', icon: '✅' },
    ...(hasAdminAccess ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }] : []),
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
              onClick={loadData}
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
          <h1 className="text-3xl font-bold text-white">Leave Management</h1>
          <p className="text-gray-400 mt-2">Manage leave requests and approvals</p>
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
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LeaveBalanceCard balance={leaveBalance} />
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Requests</span>
                    <span className="text-white font-semibold">{leaveRequests.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-yellow-400 font-semibold">
                      {leaveRequests.filter(r => r.status === 'PENDING').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Approved</span>
                    <span className="text-green-400 font-semibold">
                      {leaveRequests.filter(r => r.status === 'APPROVED').length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  {leaveRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">
                        {LEAVE_TYPES[request.leave_type as keyof typeof LEAVE_TYPES]} - {request.days_requested} days
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        LEAVE_STATUS_COLORS[request.status as keyof typeof LEAVE_STATUS_COLORS]
                      }`}>
                        {LEAVE_STATUSES[request.status as keyof typeof LEAVE_STATUSES]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'request' && (
          <LeaveRequestForm 
            onRequestCreated={handleLeaveRequestCreated}
            leaveBalance={leaveBalance}
          />
        )}

        {activeTab === 'history' && (
          <LeaveHistoryTable 
            requests={leaveRequests}
            onRequestUpdated={handleLeaveRequestUpdated}
            onRequestCancelled={handleLeaveRequestCancelled}
          />
        )}

        {activeTab === 'calendar' && (
          <LeaveCalendar 
            year={currentYear}
            requests={leaveRequests}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalDashboard 
            onRequestUpdated={handleLeaveRequestUpdated}
          />
        )}

        {activeTab === 'admin' && (
          <RoleBasedAccess allowedRoles={['admin', 'hr']}>
            <AdminLeaveBalances />
          </RoleBasedAccess>
        )}
      </div>
    </div>
  );
};
