import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50';
      case 'error':
        return 'bg-red-900/90 border-red-500/50';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/50';
      case 'info':
        return 'bg-blue-900/90 border-blue-500/50';
      default:
        return 'bg-gray-900/90 border-gray-500/50';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-100';
      case 'error':
        return 'text-red-100';
      case 'warning':
        return 'text-yellow-100';
      case 'info':
        return 'text-blue-100';
      default:
        return 'text-gray-100';
    }
  };

  return (
    <div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg max-w-sm animate-in slide-in-from-right-full duration-300`}>
      <div className="flex items-start">
        <div className="text-xl mr-3 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${getTextColor()}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {notification.message}
          </p>
          
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : action.variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onRemove}
          className={`ml-3 text-lg ${getTextColor()} opacity-70 hover:opacity-100 transition-opacity`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Hook for leave request specific notifications
export const useLeaveNotifications = () => {
  const { addNotification } = useNotifications();

  const notifyLeaveRequestCreated = useCallback(() => {
    addNotification({
      type: 'success',
      title: 'Leave Request Created',
      message: 'Your leave request has been submitted successfully and is pending approval.',
    });
  }, [addNotification]);

  const notifyLeaveRequestUpdated = useCallback(() => {
    addNotification({
      type: 'success',
      title: 'Leave Request Updated',
      message: 'Your leave request has been updated successfully.',
    });
  }, [addNotification]);

  const notifyLeaveRequestCancelled = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Leave Request Cancelled',
      message: 'Your leave request has been cancelled.',
    });
  }, [addNotification]);

  const notifyLeaveRequestApproved = useCallback((leaveType: string, days: number) => {
    addNotification({
      type: 'success',
      title: 'Leave Request Approved',
      message: `Your ${leaveType} request for ${days} day${days > 1 ? 's' : ''} has been approved.`,
    });
  }, [addNotification]);

  const notifyLeaveRequestRejected = useCallback((leaveType: string, days: number) => {
    addNotification({
      type: 'error',
      title: 'Leave Request Rejected',
      message: `Your ${leaveType} request for ${days} day${days > 1 ? 's' : ''} has been rejected.`,
    });
  }, [addNotification]);

  const notifyApprovalRequired = useCallback((count: number) => {
    addNotification({
      type: 'info',
      title: 'Approval Required',
      message: `You have ${count} leave request${count > 1 ? 's' : ''} pending your approval.`,
      actions: [
        {
          label: 'View Requests',
          action: () => {
            // This would navigate to the approvals tab
            window.location.hash = '#approvals';
          },
          variant: 'primary',
        },
      ],
    });
  }, [addNotification]);

  const notifyInsufficientBalance = useCallback((leaveType: string, available: number) => {
    addNotification({
      type: 'warning',
      title: 'Insufficient Leave Balance',
      message: `You only have ${available} day${available > 1 ? 's' : ''} remaining for ${leaveType}.`,
    });
  }, [addNotification]);

  const notifyLeaveBalanceLow = useCallback((leaveType: string, remaining: number) => {
    addNotification({
      type: 'warning',
      title: 'Low Leave Balance',
      message: `You have only ${remaining} day${remaining > 1 ? 's' : ''} remaining for ${leaveType}.`,
    });
  }, [addNotification]);

  const notifyError = useCallback((message: string) => {
    addNotification({
      type: 'error',
      title: 'Error',
      message,
    });
  }, [addNotification]);

  return {
    notifyLeaveRequestCreated,
    notifyLeaveRequestUpdated,
    notifyLeaveRequestCancelled,
    notifyLeaveRequestApproved,
    notifyLeaveRequestRejected,
    notifyApprovalRequired,
    notifyInsufficientBalance,
    notifyLeaveBalanceLow,
    notifyError,
  };
};
