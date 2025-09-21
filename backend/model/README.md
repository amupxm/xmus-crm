# Backend Model Documentation

This document describes the enhanced permission, role, team, and user management system for the XMUS CRM application.

## Overview

The system implements a comprehensive role-based access control (RBAC) system with team management and leave request workflow. The architecture supports:

- **Hierarchical permissions** with specific leave management workflows
- **Team-based organization** with team leads having elevated permissions
- **Multi-level approval process** for leave requests
- **Flexible role assignment** allowing users to have multiple roles

## Models

### 1. Permission Model (`permission.go`)

Defines granular permissions across different functional areas:

#### Leave Management Permissions
- `ASK_LEAVE` - User can request leave
- `APPROVE_LEAVE_TEAM` - Team lead can approve team member leave requests
- `APPROVE_LEAVE_HR` - HR can approve leave requests after team lead approval
- `APPROVE_LEAVE_MANAGEMENT` - Management can approve leave requests after HR approval
- `VIEW_LEAVE_REQUESTS` - User can view leave requests
- `VIEW_LEAVE_REPORTS` - User can view leave reports and analytics
- `MANAGE_LEAVE_POLICIES` - User can manage leave policies and rules

#### User Management Permissions
- `MANAGE_USERS` - User can manage other users
- `VIEW_USERS` - User can view other users
- `EDIT_PROFILE` - User can edit their profile
- `EDIT_OTHER_PROFILES` - User can edit other users' profiles

#### Team Management Permissions
- `MANAGE_TEAMS` - User can manage teams
- `VIEW_TEAMS` - User can view teams
- `ASSIGN_TEAM_LEAD` - User can assign team leads

#### Role Management Permissions
- `MANAGE_ROLES` - User can manage roles and permissions
- `VIEW_ROLES` - User can view roles and permissions

#### Reports and Analytics
- `VIEW_REPORTS` - User can view reports
- `VIEW_ANALYTICS` - User can view analytics and dashboards
- `EXPORT_DATA` - User can export data and reports

#### System Administration
- `SYSTEM_ADMIN` - User has system administration privileges
- `AUDIT_LOGS` - User can view audit logs

### 2. Role Model (`roles.go`)

Defines predefined roles with specific permission sets:

#### Employee Role
- Basic permissions for regular employees
- Can request leave, view their own data, edit profile
- Permissions: `ASK_LEAVE`, `VIEW_LEAVE_REQUESTS`, `EDIT_PROFILE`, `VIEW_TEAMS`, `VIEW_ROLES`

#### Team Lead Role
- All employee permissions plus team management capabilities
- Can approve team member leave requests
- Permissions: All employee permissions + `APPROVE_LEAVE_TEAM`, `VIEW_LEAVE_REPORTS`, `VIEW_USERS`, `EDIT_OTHER_PROFILES`, `VIEW_REPORTS`

#### HR Role
- Human resources specific permissions
- Can approve leave requests after team lead approval
- Can manage users and teams
- Permissions: Leave management, user management, team management, role management, reports

#### Management Role
- High-level permissions for management
- Can approve leave requests after HR approval
- Full access to most system functions
- Permissions: All HR permissions + `APPROVE_LEAVE_MANAGEMENT`, `SYSTEM_ADMIN`

#### Admin Role
- System administrator with all permissions
- Full access to all system functions
- Permissions: All available permissions

### 3. Team Model (`team.go`)

Manages team structure and team lead assignments:

#### Predefined Teams
- **ADMIN_TEAM** - System administration team
- **HR_TEAM** - Human Resources team
- **MANAGEMENT_TEAM** - Management team
- **DEVELOPMENT_TEAM** - Software development team
- **SALES_TEAM** - Sales and marketing team

#### Key Features
- Each team has a designated team lead
- Many-to-many relationship between users and teams
- Team lead has elevated permissions for team management
- Support for team member management

### 4. User Model (`user.go`)

Enhanced user model with role and team relationships:

#### Key Features
- **Primary Role**: Main role for the user
- **Primary Team**: Main team for the user
- **Multiple Roles**: Users can have multiple roles
- **Multiple Teams**: Users can belong to multiple teams
- **Permission Resolution**: Automatic permission resolution based on all user roles

#### User Management Functions
- `GetUserPermissions()` - Get all permissions for a user
- `HasUserPermission()` - Check if user has specific permission
- `IsUserTeamLead()` - Check if user is a team lead
- `GetUserTeams()` - Get all teams user belongs to
- `GetUserRoles()` - Get all roles user has
- Role and team assignment/removal functions

### 5. Leave Request Model (`leave_request.go`)

Implements the leave request workflow with multi-level approval:

#### Leave Types
- Annual Leave
- Sick Leave
- Personal Leave
- Emergency Leave
- Maternity/Paternity Leave
- Unpaid Leave

#### Approval Workflow
1. **Employee** submits leave request
2. **Team Lead** reviews and approves/rejects (if user is not team lead)
3. **HR** reviews and approves/rejects
4. **Management** reviews and approves/rejects
5. **Final Approval** - Leave is approved

#### Status Flow
- `PENDING` → `TEAM_LEAD_APPROVED` → `HR_APPROVED` → `MANAGEMENT_APPROVED` → `APPROVED`
- Any level can reject: `REJECTED`
- Employee can cancel: `CANCELLED`

#### Key Features
- Automatic team lead assignment based on user's team
- Multi-level approval tracking
- Comments at each approval level
- Date range validation
- Statistics and reporting

## Database Relationships

### User-Role Relationship
- Many-to-many relationship via `user_roles` table
- Users can have multiple roles
- Roles can be assigned to multiple users

### User-Team Relationship
- Many-to-many relationship via `team_members` table
- Users can belong to multiple teams
- Teams can have multiple members

### Team-Lead Relationship
- One-to-one relationship
- Each team has one team lead
- Team lead is a user with elevated permissions

### Leave Request Relationships
- Leave request belongs to one user
- Leave request can be assigned to one team lead
- Approval workflow tracks multiple approvers

## Usage Examples

### Check User Permissions
```go
userModel := NewUserModel(db)
hasPermission, err := userModel.HasUserPermission(userID, "APPROVE_LEAVE_TEAM")
```

### Get User's Leave Requests
```go
leaveModel := NewLeaveRequestModel(db)
requests, err := leaveModel.GetUserLeaveRequests(userID)
```

### Create Leave Request
```go
request := &LeaveRequest{
    UserID: userID,
    LeaveType: LeaveTypeAnnual,
    StartDate: startDate,
    EndDate: endDate,
    DaysRequested: 5,
    Reason: "Vacation",
}
err := leaveModel.CreateLeaveRequest(request)
```

### Approve Leave Request (Team Lead)
```go
err := leaveModel.ApproveByTeamLead(requestID, teamLeadID, "Approved for vacation")
```

## Frontend Integration

The system is designed to provide data to the frontend for:

1. **Permission-based UI rendering** - Show/hide components based on user permissions
2. **Role-based navigation** - Display appropriate menu items based on user roles
3. **Team management** - Allow team leads to manage their teams
4. **Leave request workflow** - Provide appropriate approval interfaces for each role
5. **Reports and analytics** - Display relevant reports based on user permissions

## Security Considerations

1. **Permission Validation** - Always validate permissions on the backend
2. **Role Hierarchy** - Team leads have elevated permissions within their teams
3. **Approval Chain** - Leave requests follow a strict approval hierarchy
4. **Audit Trail** - All actions are tracked with timestamps and comments
5. **Data Isolation** - Users can only see data they have permission to access

## Future Enhancements

1. **Dynamic Permissions** - Allow runtime permission changes
2. **Custom Roles** - Allow creation of custom roles with specific permissions
3. **Team Hierarchies** - Support for nested team structures
4. **Workflow Customization** - Allow customization of approval workflows
5. **Notification System** - Integrate with notification system for approvals
