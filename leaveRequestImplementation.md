# Leave Request System Implementation Documentation

## Overview

This document outlines the implementation requirements for a comprehensive leave request system in the XMUS CRM application. The system supports multiple leave types, hierarchical approval workflows, and role-based access control.

## System Requirements

### 1. Leave Types

The system supports two primary leave types as specified:

- **Sick Leave** (`SICK`) - Medical leave for illness or health-related issues
- **Annual Leave / Vacation Leave** (`ANNUAL`) - Planned vacation time

Additional leave types are available for future expansion:
- Personal Leave (`PERSONAL`)
- Emergency Leave (`EMERGENCY`)
- Maternity Leave (`MATERNITY`)
- Paternity Leave (`PATERNITY`)
- Unpaid Leave (`UNPAID`)

### 2. User Leave Tracking

Each user must be able to view their leave consumption by type for the current year:

- **Leave Balance Display**: Show remaining leave days by type
- **Leave History**: Display all leave requests with status and dates
- **Yearly Reset**: Leave balances reset annually (configurable date)
- **Real-time Updates**: Balances update immediately upon approval/rejection

### 3. Approval Workflow

The system implements a multi-level approval process based on user roles and leave duration:

#### For Team Members (Non-Team Leads)
1. **Employee** submits leave request
2. **Team Lead** reviews and approves/rejects
3. **HR** reviews and approves/rejects
4. **Management** reviews and approves/rejects (if duration > 4 days)
5. **Final Approval** - Leave is approved

#### For Team Leads
1. **Team Lead** submits leave request
2. **HR** reviews and approves/rejects
3. **Management** reviews and approves/rejects (if duration > 4 days)
4. **Final Approval** - Leave is approved

#### Approval Rules
- **Short Leave (≤ 4 days)**: Team Lead → HR → Approved
- **Long Leave (> 4 days)**: Team Lead → HR → Management → Approved
- **Team Leads**: Skip Team Lead approval, go directly to HR
- **Any level can reject**: Rejection stops the workflow
- **Cancellation**: Employee can cancel before HR approval

## Technical Implementation

### 1. Database Schema

The existing `LeaveRequest` model already supports the required functionality:

```go
type 
 struct {
    ID            uint               `gorm:"primaryKey"`
    UserID        uint               `gorm:"not null"`
    LeaveType     LeaveType          `gorm:"not null"`
    StartDate     time.Time          `gorm:"not null"`
    EndDate       time.Time          `gorm:"not null"`
    DaysRequested int                `gorm:"not null"`
    Reason        string             `gorm:"type:text"`
    Status        LeaveRequestStatus `gorm:"default:'PENDING'"`
    
    // Approval workflow
    TeamLeadID         *uint
    TeamLeadApprovedAt *time.Time
    TeamLeadComments   string
    
    HRApprovedAt *time.Time
    HRComments   string
    
    ManagementApprovedAt *time.Time
    ManagementComments   string
    
    // Metadata
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt
    
    // Relationships
    User     User  `gorm:"foreignKey:UserID"`
    TeamLead *User `gorm:"foreignKey:TeamLeadID"`
}
```

### 2. Required API Endpoints

#### Leave Request Management
- `POST /api/leave-requests` - Create new leave request
- `GET /api/leave-requests` - Get user's leave requests
- `GET /api/leave-requests/:id` - Get specific leave request
- `PUT /api/leave-requests/:id` - Update leave request (before approval)
- `DELETE /api/leave-requests/:id` - Cancel leave request

#### Leave Balance & Statistics
- `GET /api/leave-requests/balance` - Get user's leave balance by type
- `GET /api/leave-requests/stats` - Get leave statistics for user
- `GET /api/leave-requests/calendar/:year` - Get leave calendar for year

#### Approval Workflow
- `GET /api/leave-requests/pending/team-lead` - Get pending team lead approvals
- `GET /api/leave-requests/pending/hr` - Get pending HR approvals
- `GET /api/leave-requests/pending/management` - Get pending management approvals
- `POST /api/leave-requests/:id/approve/team-lead` - Team lead approval
- `POST /api/leave-requests/:id/reject/team-lead` - Team lead rejection
- `POST /api/leave-requests/:id/approve/hr` - HR approval
- `POST /api/leave-requests/:id/reject/hr` - HR rejection
- `POST /api/leave-requests/:id/approve/management` - Management approval
- `POST /api/leave-requests/:id/reject/management` - Management rejection

### 3. Frontend Components Required

#### User Interface Components
- **LeaveRequestForm** - Form to create/edit leave requests
- **LeaveBalanceCard** - Display remaining leave days by type
- **LeaveHistoryTable** - Show user's leave request history
- **LeaveCalendar** - Calendar view of approved leaves
- **ApprovalDashboard** - Interface for approvers to manage requests

#### Role-Specific Views
- **EmployeeView** - Leave request creation and history
- **TeamLeadView** - Team member leave approvals
- **HRView** - HR-level approvals and leave management
- **ManagementView** - Management-level approvals and reporting

### 4. Business Logic Implementation

#### Leave Balance Calculation
```go
func (l *LeaveRequestModel) GetUserLeaveBalance(userID uint, year int) (map[LeaveType]int, error) {
    // Calculate total allocated leave by type for the year
    // Calculate total used leave by type for the year
    // Return remaining balance
}
```

#### Approval Workflow Logic
```go
func (l *LeaveRequestModel) ProcessApproval(requestID uint, approverID uint, action string, comments string) error {
    // Determine next approval step based on current status
    // Check if approver has permission for current step
    // Update status and approver information
    // Send notifications to next approver
}
```

#### Leave Duration Validation
```go
func (l *LeaveRequestModel) ValidateLeaveRequest(request *LeaveRequest) error {
    // Check if start date is not in the past
    // Check if end date is after start date
    // Check if user has sufficient leave balance
    // Check for overlapping leave requests
    // Validate business rules (minimum notice period, etc.)
}
```

### 5. Permission System Integration

The existing permission system already includes the required permissions:

- `ASK_LEAVE` - User can request leave
- `APPROVE_LEAVE_TEAM` - Team lead can approve team member leave requests
- `APPROVE_LEAVE_HR` - HR can approve leave requests
- `APPROVE_LEAVE_MANAGEMENT` - Management can approve leave requests
- `VIEW_LEAVE_REQUESTS` - User can view leave requests
- `VIEW_LEAVE_REPORTS` - User can view leave reports

### 6. Notification System

Implement notifications for:
- Leave request submitted (to team lead/HR)
- Leave request approved/rejected (to employee)
- Leave request pending approval (to next approver)
- Leave balance low warnings
- Leave request cancellation

### 7. Configuration Management

#### Leave Policies
- Annual leave allocation per user/role
- Sick leave allocation per user/role
- Minimum notice period for leave requests
- Maximum consecutive leave days
- Blackout dates (holidays, busy periods)
- Carry-over rules for unused leave

#### Approval Rules
- Team lead approval required for team members
- HR approval required for all requests
- Management approval required for leaves > 4 days
- Emergency leave approval process
- Auto-approval for certain leave types/durations

### 8. Reporting and Analytics

#### User Reports
- Personal leave summary
- Leave balance by type
- Leave history and trends
- Upcoming leave requests

#### Management Reports
- Team leave utilization
- Department leave statistics
- Approval workflow metrics
- Leave policy compliance

#### HR Reports
- Company-wide leave statistics
- Leave request approval rates
- Leave balance distribution
- Policy effectiveness metrics

### 9. Data Migration

#### Initial Setup
- Set default leave allocations for existing users
- Configure leave policies
- Set up approval workflows
- Migrate any existing leave data

#### Yearly Reset Process
- Reset leave balances
- Archive previous year's data
- Apply carry-over rules
- Update leave allocations

### 10. Security Considerations

#### Access Control
- Role-based access to leave data
- Team-based data isolation
- Audit trail for all leave actions
- Secure approval workflow

#### Data Privacy
- Personal leave information protection
- Medical leave confidentiality
- Secure data transmission
- Compliance with data protection regulations

## Implementation Phases

### Phase 1: Core Functionality
1. Implement leave request creation and management
2. Build basic approval workflow
3. Create user leave balance tracking
4. Develop basic UI components

### Phase 2: Advanced Features
1. Implement notification system
2. Add leave calendar functionality
3. Build reporting and analytics
4. Add configuration management

### Phase 3: Optimization
1. Performance optimization
2. Advanced reporting features
3. Mobile responsiveness
4. Integration with external systems

## Testing Strategy

### Unit Tests
- Leave request validation
- Approval workflow logic
- Balance calculation
- Permission checks

### Integration Tests
- API endpoint functionality
- Database operations
- Workflow transitions
- Notification delivery

### User Acceptance Tests
- End-to-end leave request process
- Role-based access verification
- Approval workflow testing
- UI/UX validation

## Deployment Considerations

### Environment Setup
- Database migration scripts
- Configuration management
- Environment-specific settings
- Backup and recovery procedures

### Monitoring
- Leave request processing metrics
- Approval workflow performance
- System health monitoring
- Error tracking and alerting

## Maintenance and Support

### Regular Tasks
- Leave balance calculations
- Yearly reset procedures
- Data archiving
- Performance monitoring

### User Support
- Leave request assistance
- Approval workflow guidance
- Technical support
- Training materials

This implementation provides a comprehensive leave request system that meets all specified requirements while maintaining flexibility for future enhancements and integrations.
