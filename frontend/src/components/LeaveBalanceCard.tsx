import React from 'react';
import { LEAVE_TYPES, LeaveBalance } from '../services/leaveRequestsApi';

interface LeaveBalanceCardProps {
  balance: LeaveBalance[];
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ balance }) => {
  const getLeaveTypeName = (leaveType: string) => {
    return LEAVE_TYPES[leaveType as keyof typeof LEAVE_TYPES] || leaveType;
  };

  const getProgressPercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (balance.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Leave Balance</h3>
        <p className="text-gray-400">No leave balance data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Leave Balance</h3>
      <div className="space-y-4">
        {balance.map((item) => {
          const percentage = getProgressPercentage(item.used_days, item.total_allocated);
          const progressColor = getProgressColor(percentage);
          
          return (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">
                  {getLeaveTypeName(item.leave_type)}
                </span>
                <span className="text-white font-semibold">
                  {item.remaining_days} / {item.total_allocated}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${progressColor} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>Used: {item.used_days} days</span>
                <span>Remaining: {item.remaining_days} days</span>
              </div>
              
              {item.carry_over_days > 0 && (
                <div className="text-xs text-blue-400">
                  Carry-over: {item.carry_over_days} days
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
