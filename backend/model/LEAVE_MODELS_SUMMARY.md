# Leave Request System Models Summary

This document provides an overview of all the models created for the leave request system in the XMUS CRM application.

## Models Overview

### 1. LeaveRequest Model (`leave_request.go`)
**Enhanced existing model with additional business logic**

**Key Features:**
- Multi-level approval workflow (Team Lead → HR → Management)
- Leave type validation and tracking
- Overlap detection and validation
- Comprehensive reporting and statistics

**Key Methods:**
- `CreateLeaveRequest()` - Creates new leave request with team lead assignment
- `ValidateLeaveRequest()` - Validates leave request before creation
- `CheckLeaveOverlap()` - Checks for overlapping leave requests
- `GetUserLeaveBalanceByType()` - Gets leave balance by type for a year
- `ProcessLeaveRequestWorkflow()` - Handles approval workflow logic
- `GetLeaveRequestWorkflowStatus()` - Returns current workflow status
- `GetLeaveRequestTimeline()` - Returns approval timeline
- `GetLeaveRequestSummary()` - Returns summary statistics

### 2. LeaveBalance Model (`leave_balance.go`)
**Tracks user leave balances by type and year**

**Key Features:**
- Yearly leave balance tracking
- Carry-over rules implementation
- Real-time balance updates
- Low balance warnings

**Key Methods:**
- `CreateLeaveBalance()` - Creates leave balance record
- `GetUserLeaveBalance()` - Gets user's leave balance for a year
- `IncrementUsedDays()` - Updates used days when leave is approved
- `DecrementUsedDays()` - Updates used days when leave is cancelled
- `InitializeUserLeaveBalances()` - Initializes balances based on policies
- `ResetLeaveBalancesForNewYear()` - Handles yearly reset with carry-over

### 3. LeavePolicy Model (`leave_policy.go`)
**Configurable leave rules and allocations**

**Key Features:**
- Flexible leave type configurations
- Notice period requirements
- Maximum consecutive days limits
- Carry-over rules
- Approval requirements

**Key Methods:**
- `CreateLeavePolicy()` - Creates new leave policy
- `GetLeavePoliciesByYear()` - Gets policies for a specific year
- `InitializeDefaultPolicies()` - Creates default policies for a year
- `ValidateLeaveRequestAgainstPolicy()` - Validates requests against policies
- `CopyPoliciesFromPreviousYear()` - Copies policies from previous year

### 4. LeaveNotification Model (`leave_notification.go`)
**Handles approval notifications and alerts**

**Key Features:**
- Multiple notification types
- Read/unread status tracking
- Bulk notification creation
- Notification statistics

**Key Methods:**
- `CreateNotification()` - Creates new notification
- `GetUserNotifications()` - Gets user's notifications
- `MarkAsRead()` - Marks notification as read
- `CreateLeaveRequestNotification()` - Creates leave request notification
- `CreateApprovalNotification()` - Creates approval/rejection notification
- `CreateBalanceLowNotification()` - Creates low balance warning

### 5. LeaveCalendar Model (`leave_calendar.go`)
**Calendar view functionality and date management**

**Key Features:**
- Calendar entry creation for leave requests
- Date availability checking
- Team calendar views
- Monthly/yearly calendar statistics

**Key Methods:**
- `CreateCalendarEntriesForLeaveRequest()` - Creates calendar entries
- `GetCalendarEntriesForUser()` - Gets user's calendar entries
- `GetCalendarEntriesForTeam()` - Gets team's calendar entries
- `CheckDateAvailability()` - Checks if date is available
- `GetAvailableDates()` - Gets available dates in a range
- `GetCalendarStats()` - Returns calendar statistics

## Database Schema

### LeaveRequest Table
```sql
CREATE TABLE leave_requests (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(20) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    days_requested INT NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    team_lead_id BIGINT,
    team_lead_approved_at TIMESTAMP,
    team_lead_comments TEXT,
    hr_approved_at TIMESTAMP,
    hr_comments TEXT,
    management_approved_at TIMESTAMP,
    management_comments TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### LeaveBalance Table
```sql
CREATE TABLE leave_balances (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    total_allocated INT DEFAULT 0,
    used_days INT DEFAULT 0,
    remaining_days INT DEFAULT 0,
    carry_over_days INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### LeavePolicy Table
```sql
CREATE TABLE leave_policies (
    id BIGINT PRIMARY KEY,
    leave_type VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    default_allocation INT DEFAULT 0,
    max_allocation INT DEFAULT 0,
    min_notice_days INT DEFAULT 1,
    max_consecutive_days INT DEFAULT 30,
    allow_carry_over BOOLEAN DEFAULT true,
    max_carry_over INT DEFAULT 0,
    requires_approval BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### LeaveNotification Table
```sql
CREATE TABLE leave_notifications (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    leave_request_id BIGINT,
    notification_type VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'UNREAD',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### LeaveCalendarEntry Table
```sql
CREATE TABLE leave_calendar_entries (
    id BIGINT PRIMARY KEY,
    leave_request_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    leave_type VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    is_half_day BOOLEAN DEFAULT false,
    is_morning BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

## Integration Points

### With Existing Models
- **User Model**: All leave models reference users for relationships
- **Team Model**: Leave requests are assigned to team leads based on user's team
- **Role Model**: Permission-based access control for leave operations

### With Permission System
- `ASK_LEAVE` - Create leave requests
- `APPROVE_LEAVE_TEAM` - Team lead approvals
- `APPROVE_LEAVE_HR` - HR approvals
- `APPROVE_LEAVE_MANAGEMENT` - Management approvals
- `VIEW_LEAVE_REQUESTS` - View leave requests
- `VIEW_LEAVE_REPORTS` - View leave reports

## Usage Examples

### Creating a Leave Request
```go
leaveModel := model.NewLeaveRequestModel(db)
request := &model.LeaveRequest{
    UserID:    userID,
    LeaveType: model.LeaveTypeAnnual,
    StartDate: startDate,
    EndDate:   endDate,
    Reason:    "Vacation",
}
err := leaveModel.CreateLeaveRequest(request)
```

### Getting Leave Balance
```go
balanceModel := model.NewLeaveBalanceModel(db)
balance, err := balanceModel.GetUserLeaveBalance(userID, 2024)
```

### Processing Approval
```go
err := leaveModel.ProcessLeaveRequestWorkflow(requestID, approverID, "approve", "Approved")
```

### Getting Calendar Entries
```go
calendarModel := model.NewLeaveCalendarModel(db)
entries, err := calendarModel.GetCalendarEntriesForUser(userID, startDate, endDate)
```

## Next Steps

1. **API Implementation**: Create REST API endpoints for all model operations
2. **Frontend Components**: Build React components for leave management UI
3. **Database Migration**: Create migration scripts for the new tables
4. **Testing**: Write unit and integration tests for all models
5. **Documentation**: Create API documentation and user guides

This comprehensive model system provides all the necessary functionality for a complete leave request management system with multi-level approval workflows, balance tracking, policy management, notifications, and calendar integration.
