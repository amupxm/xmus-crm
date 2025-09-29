import React, { useState } from 'react';
import { LEAVE_STATUS_COLORS, LEAVE_TYPES, LeaveRequest } from '../services/leaveRequestsApi';

interface LeaveCalendarProps {
  year: number;
  requests: LeaveRequest[];
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ year, requests }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getRequestsForDate = (date: Date) => {
    return requests.filter(request => {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getRequestsForMonth = () => {
    const monthStart = new Date(year, currentMonth, 1);
    const monthEnd = new Date(year, currentMonth + 1, 0);
    
    return requests.filter(request => {
      const requestStart = new Date(request.start_date);
      const requestEnd = new Date(request.end_date);
      return requestStart <= monthEnd && requestEnd >= monthStart;
    });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, year);
    const firstDay = getFirstDayOfMonth(currentMonth, year);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-700"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, currentMonth, day);
      const dayRequests = getRequestsForDate(date);
      const isCurrentDay = isToday(date);
      const isSelectedDay = isSelected(date);

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-700 p-2 cursor-pointer hover:bg-gray-700/30 ${
            isCurrentDay ? 'bg-blue-900/30' : ''
          } ${isSelectedDay ? 'bg-blue-600/30' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium ${
              isCurrentDay ? 'text-blue-400' : 'text-white'
            }`}>
              {day}
            </span>
            {dayRequests.length > 0 && (
              <span className="text-xs text-gray-400">
                {dayRequests.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {dayRequests.slice(0, 2).map((request, index) => (
              <div
                key={index}
                className={`text-xs px-2 py-1 rounded truncate ${
                  LEAVE_STATUS_COLORS[request.status as keyof typeof LEAVE_STATUS_COLORS] || 'bg-gray-600'
                }`}
                title={`${LEAVE_TYPES[request.leave_type as keyof typeof LEAVE_TYPES]} - ${request.status}`}
              >
                {LEAVE_TYPES[request.leave_type as keyof typeof LEAVE_TYPES]}
              </div>
            ))}
            {dayRequests.length > 2 && (
              <div className="text-xs text-gray-400">
                +{dayRequests.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthRequests = getRequestsForMonth();

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          {months[currentMonth]} {year}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 bg-gray-700/50">
          {daysOfWeek.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          {(() => {
            const dayRequests = getRequestsForDate(selectedDate);
            if (dayRequests.length === 0) {
              return (
                <p className="text-gray-400">No leave requests for this date</p>
              );
            }

            return (
              <div className="space-y-3">
                {dayRequests.map((request, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-white">
                        {LEAVE_TYPES[request.leave_type as keyof typeof LEAVE_TYPES]}
                      </h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        LEAVE_STATUS_COLORS[request.status as keyof typeof LEAVE_STATUS_COLORS] || 'bg-gray-600'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>Duration: {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}</p>
                      <p>Period: {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</p>
                      {request.reason && (
                        <p>Reason: {request.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Month Summary */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Month Summary</h4>
        
        {monthRequests.length === 0 ? (
          <p className="text-gray-400">No leave requests for {months[currentMonth]} {year}</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{monthRequests.length}</div>
                <div className="text-sm text-gray-400">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {monthRequests.filter(r => r.status === 'APPROVED').length}
                </div>
                <div className="text-sm text-gray-400">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {monthRequests.filter(r => r.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {monthRequests.reduce((sum, r) => sum + r.days_requested, 0)}
                </div>
                <div className="text-sm text-gray-400">Total Days</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
