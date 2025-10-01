import React, { useEffect, useState } from 'react';
import { ApprovalLevelInfo, leaveRequestsApi } from '../services/leaveRequestsApi';

interface ApprovalLevelDisplayProps {
  requestId: number;
  onClose?: () => void;
}

export const ApprovalLevelDisplay: React.FC<ApprovalLevelDisplayProps> = ({ requestId, onClose }) => {
  const [approvalInfo, setApprovalInfo] = useState<ApprovalLevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApprovalInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const info = await leaveRequestsApi.getApprovalLevelInfo(requestId);
        setApprovalInfo(info);
      } catch (err) {
        setError('Failed to load approval information');
        console.error('Error loading approval info:', err);
      } finally {
        setLoading(false);
      }
    };

    loadApprovalInfo();
  }, [requestId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !approvalInfo) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-400 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-red-400 font-semibold">Error</h3>
            <p className="text-red-300 mt-1">{error || 'Failed to load approval information'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { levels, workflow, request_info } = approvalInfo;

  const getStepStatus = (step: string) => {
    if (workflow.completed_steps.includes(step)) {
      return 'completed';
    }
    if (workflow.remaining_steps.includes(step)) {
      return workflow.remaining_steps[0] === step ? 'current' : 'pending';
    }
    return 'not_required';
  };

  const getStepColor = (step: string) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-900/20 border-green-500/50';
      case 'current':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/50';
      case 'pending':
        return 'text-gray-400 bg-gray-900/20 border-gray-600/50';
      default:
        return 'text-gray-500 bg-gray-800/20 border-gray-700/50';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Approval Workflow</h3>
          <p className="text-gray-400 mt-1">
            {request_info.leave_type} - {request_info.days_requested} days
          </p>
          <p className="text-sm text-gray-500">
            {new Date(request_info.start_date).toLocaleDateString()} - {new Date(request_info.end_date).toLocaleDateString()}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Approval Flow Steps */}
      <div className="space-y-4">
        {workflow.approval_flow.map((step, index) => {
          const stepInfo = levels[step];
          const status = getStepStatus(step);
          const isLast = index === workflow.approval_flow.length - 1;

          return (
            <div key={step} className="relative">
              <div className={`flex items-center p-4 rounded-lg border ${getStepColor(step)}`}>
                <div className="flex-shrink-0 mr-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'current' ? 'bg-blue-500' :
                    'bg-gray-600'
                  }`}>
                    {status === 'completed' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-lg">{stepInfo.icon}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{stepInfo.name}</h4>
                  <p className="text-sm text-gray-300 mt-1">{stepInfo.description}</p>
                  {status === 'current' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current Step
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {status === 'completed' && (
                    <span className="text-green-400 text-sm font-medium">✓ Completed</span>
                  )}
                  {status === 'current' && (
                    <span className="text-blue-400 text-sm font-medium">⏳ In Progress</span>
                  )}
                  {status === 'pending' && (
                    <span className="text-gray-400 text-sm">⏸️ Pending</span>
                  )}
                </div>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-6 top-16 w-0.5 h-4 bg-gray-600"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Summary */}
      <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-white">Current Status</h4>
            <p className="text-sm text-gray-300">
              {levels[workflow.current_level]?.name || 'Unknown Status'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">
              {workflow.is_final ? 'Final Status' : `Next: ${levels[workflow.next_level || '']?.name || 'Unknown'}`}
            </p>
            {request_info.requires_management && (
              <p className="text-xs text-orange-400 mt-1">
                Management approval required (&gt;4 days)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>{workflow.completed_steps.length} / {workflow.approval_flow.length}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(workflow.completed_steps.length / workflow.approval_flow.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
