package model

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// LeaveRequestStatus represents the status of a leave request
type LeaveRequestStatus string

const (
	StatusPending            LeaveRequestStatus = "PENDING"
	StatusTeamLeadApproved   LeaveRequestStatus = "TEAM_LEAD_APPROVED"
	StatusHRApproved         LeaveRequestStatus = "HR_APPROVED"
	StatusManagementApproved LeaveRequestStatus = "MANAGEMENT_APPROVED"
	StatusApproved           LeaveRequestStatus = "APPROVED"
	StatusRejected           LeaveRequestStatus = "REJECTED"
	StatusCancelled          LeaveRequestStatus = "CANCELLED"
)

// LeaveType represents the type of leave
type LeaveType string

const (
	LeaveTypeAnnual    LeaveType = "ANNUAL"
	LeaveTypeSick      LeaveType = "SICK"
	LeaveTypePersonal  LeaveType = "PERSONAL"
	LeaveTypeEmergency LeaveType = "EMERGENCY"
	LeaveTypeMaternity LeaveType = "MATERNITY"
	LeaveTypePaternity LeaveType = "PATERNITY"
	LeaveTypeUnpaid    LeaveType = "UNPAID"
)

// LeaveRequest represents a leave request with approval workflow
type LeaveRequest struct {
	ID            uint               `gorm:"primaryKey"`
	UserID        uint               `gorm:"not null"`
	LeaveType     LeaveType          `gorm:"not null"`
	StartDate     time.Time          `gorm:"not null"`
	EndDate       time.Time          `gorm:"not null"`
	DaysRequested int                `gorm:"not null"`
	Reason        string             `gorm:"type:text"`
	Status        LeaveRequestStatus `gorm:"default:'PENDING'"`

	// Approval workflow
	TeamLeadID         *uint // Team lead who should approve
	TeamLeadApprovedAt *time.Time
	TeamLeadComments   string `gorm:"type:text"`

	HRApprovedAt *time.Time
	HRComments   string `gorm:"type:text"`

	ManagementApprovedAt *time.Time
	ManagementComments   string `gorm:"type:text"`

	// Metadata
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt

	// Relationships
	User     User  `gorm:"foreignKey:UserID"`
	TeamLead *User `gorm:"foreignKey:TeamLeadID"`
}

// LeaveRequestModel handles leave request database operations
type LeaveRequestModel struct {
	db *gorm.DB
}

func NewLeaveRequestModel(db *gorm.DB) *LeaveRequestModel {
	return &LeaveRequestModel{
		db: db,
	}
}

// CreateLeaveRequest creates a new leave request
func (l *LeaveRequestModel) CreateLeaveRequest(request *LeaveRequest) error {
	// Set team lead for the request based on user's team
	user, err := l.getUserWithTeam(request.UserID)
	if err != nil {
		return err
	}

	// Find team lead for user's primary team
	team, err := GetTeamByID(user.PrimaryTeamID)
	if err != nil {
		return err
	}

	if team.TeamLeadID != 0 {
		request.TeamLeadID = &team.TeamLeadID
	}

	return l.db.Create(request).Error
}

// GetLeaveRequest retrieves a leave request by ID
func (l *LeaveRequestModel) GetLeaveRequest(id uint) (*LeaveRequest, error) {
	var request LeaveRequest
	if err := l.db.Preload("User").Preload("TeamLead").First(&request, id).Error; err != nil {
		return nil, err
	}
	return &request, nil
}

// GetUserLeaveRequests retrieves all leave requests for a user
func (l *LeaveRequestModel) GetUserLeaveRequests(userID uint) ([]LeaveRequest, error) {
	var requests []LeaveRequest
	if err := l.db.Where("user_id = ?", userID).
		Preload("User").Preload("TeamLead").
		Order("created_at DESC").
		Find(&requests).Error; err != nil {
		return nil, err
	}
	return requests, nil
}

// GetPendingTeamLeadApprovals retrieves leave requests pending team lead approval
func (l *LeaveRequestModel) GetPendingTeamLeadApprovals(teamLeadID uint) ([]LeaveRequest, error) {
	var requests []LeaveRequest
	if err := l.db.Where("team_lead_id = ? AND status = ?", teamLeadID, StatusPending).
		Preload("User").Preload("TeamLead").
		Order("created_at ASC").
		Find(&requests).Error; err != nil {
		return nil, err
	}
	return requests, nil
}

// GetPendingHRApprovals retrieves leave requests pending HR approval
func (l *LeaveRequestModel) GetPendingHRApprovals() ([]LeaveRequest, error) {
	var requests []LeaveRequest
	if err := l.db.Where("status = ?", StatusTeamLeadApproved).
		Preload("User").Preload("TeamLead").
		Order("team_lead_approved_at ASC").
		Find(&requests).Error; err != nil {
		return nil, err
	}
	return requests, nil
}

// GetPendingManagementApprovals retrieves leave requests pending management approval
func (l *LeaveRequestModel) GetPendingManagementApprovals() ([]LeaveRequest, error) {
	var requests []LeaveRequest
	if err := l.db.Where("status = ?", StatusHRApproved).
		Preload("User").Preload("TeamLead").
		Order("hr_approved_at ASC").
		Find(&requests).Error; err != nil {
		return nil, err
	}
	return requests, nil
}

// ApproveByTeamLead approves a leave request by team lead
func (l *LeaveRequestModel) ApproveByTeamLead(requestID uint, teamLeadID uint, comments string) error {
	now := time.Now()
	return l.db.Model(&LeaveRequest{}).
		Where("id = ? AND team_lead_id = ? AND status = ?", requestID, teamLeadID, StatusPending).
		Updates(map[string]interface{}{
			"status":                StatusTeamLeadApproved,
			"team_lead_approved_at": &now,
			"team_lead_comments":    comments,
		}).Error
}

// RejectByTeamLead rejects a leave request by team lead
func (l *LeaveRequestModel) RejectByTeamLead(requestID uint, teamLeadID uint, comments string) error {
	return l.db.Model(&LeaveRequest{}).
		Where("id = ? AND team_lead_id = ? AND status = ?", requestID, teamLeadID, StatusPending).
		Updates(map[string]interface{}{
			"status":             StatusRejected,
			"team_lead_comments": comments,
		}).Error
}

// ApproveByHR approves a leave request by HR
func (l *LeaveRequestModel) ApproveByHR(requestID uint, comments string) error {
	now := time.Now()
	return l.db.Model(&LeaveRequest{}).
		Where("id = ? AND status = ?", requestID, StatusTeamLeadApproved).
		Updates(map[string]interface{}{
			"status":         StatusHRApproved,
			"hr_approved_at": &now,
			"hr_comments":    comments,
		}).Error
}

// RejectByHR rejects a leave request by HR
func (l *LeaveRequestModel) RejectByHR(requestID uint, comments string) error {
	return l.db.Model(&LeaveRequest{}).
		Where("id = ? AND status = ?", requestID, StatusTeamLeadApproved).
		Updates(map[string]interface{}{
			"status":      StatusRejected,
			"hr_comments": comments,
		}).Error
}

// ApproveByManagement approves a leave request by management
func (l *LeaveRequestModel) ApproveByManagement(requestID uint, comments string) error {
	now := time.Now()
	return l.db.Model(&LeaveRequest{}).
		Where("id = ? AND status = ?", requestID, StatusHRApproved).
		Updates(map[string]interface{}{
			"status":                 StatusManagementApproved,
			"management_approved_at": &now,
			"management_comments":    comments,
		}).Error
}

// RejectByManagement rejects a leave request by management
func (l *LeaveRequestModel) RejectByManagement(requestID uint, comments string) error {
	return l.db.Model(&LeaveRequest{}).
		Where("id = ? AND status = ?", requestID, StatusHRApproved).
		Updates(map[string]interface{}{
			"status":              StatusRejected,
			"management_comments": comments,
		}).Error
}

// CancelLeaveRequest cancels a leave request (only by the requester)
func (l *LeaveRequestModel) CancelLeaveRequest(requestID uint, userID uint) error {
	return l.db.Model(&LeaveRequest{}).
		Where("id = ? AND user_id = ? AND status IN ?", requestID, userID, []LeaveRequestStatus{StatusPending, StatusTeamLeadApproved}).
		Update("status", StatusCancelled).Error
}

// GetLeaveRequestsByStatus retrieves leave requests by status
func (l *LeaveRequestModel) GetLeaveRequestsByStatus(status LeaveRequestStatus) ([]LeaveRequest, error) {
	var requests []LeaveRequest
	if err := l.db.Where("status = ?", status).
		Preload("User").Preload("TeamLead").
		Order("created_at DESC").
		Find(&requests).Error; err != nil {
		return nil, err
	}
	return requests, nil
}

// GetLeaveRequestsInDateRange retrieves leave requests within a date range
func (l *LeaveRequestModel) GetLeaveRequestsInDateRange(startDate, endDate time.Time) ([]LeaveRequest, error) {
	var requests []LeaveRequest
	if err := l.db.Where("start_date >= ? AND end_date <= ?", startDate, endDate).
		Preload("User").Preload("TeamLead").
		Order("start_date ASC").
		Find(&requests).Error; err != nil {
		return nil, err
	}
	return requests, nil
}

// UpdateLeaveRequest updates a leave request
func (l *LeaveRequestModel) UpdateLeaveRequest(request *LeaveRequest) error {
	return l.db.Save(request).Error
}

// DeleteLeaveRequest soft deletes a leave request
func (l *LeaveRequestModel) DeleteLeaveRequest(id uint) error {
	return l.db.Delete(&LeaveRequest{}, id).Error
}

// Helper function to get user with team information
func (l *LeaveRequestModel) getUserWithTeam(userID uint) (*User, error) {
	var user User
	if err := l.db.First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetLeaveRequestStats returns statistics about leave requests
func (l *LeaveRequestModel) GetLeaveRequestStats(userID uint) (map[string]int, error) {
	stats := make(map[string]int)

	// Count by status
	statuses := []LeaveRequestStatus{StatusPending, StatusTeamLeadApproved, StatusHRApproved, StatusManagementApproved, StatusApproved, StatusRejected, StatusCancelled}

	for _, status := range statuses {
		var count int64
		if err := l.db.Model(&LeaveRequest{}).Where("user_id = ? AND status = ?", userID, status).Count(&count).Error; err != nil {
			return nil, err
		}
		stats[string(status)] = int(count)
	}

	return stats, nil
}

// GetUserLeaveBalanceByType returns leave balance for a user by leave type for a specific year
func (l *LeaveRequestModel) GetUserLeaveBalanceByType(userID uint, year int) (map[LeaveType]int, error) {
	balance := make(map[LeaveType]int)

	// Get all approved leave requests for the year
	var requests []LeaveRequest
	startOfYear := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	endOfYear := time.Date(year, 12, 31, 23, 59, 59, 999999999, time.UTC)

	if err := l.db.Where("user_id = ? AND status = ? AND start_date >= ? AND start_date <= ?",
		userID, StatusApproved, startOfYear, endOfYear).Find(&requests).Error; err != nil {
		return nil, err
	}

	// Count days by leave type
	for _, request := range requests {
		balance[request.LeaveType] += request.DaysRequested
	}

	return balance, nil
}

// GetUserLeaveBalanceForCurrentYear returns leave balance for current year
func (l *LeaveRequestModel) GetUserLeaveBalanceForCurrentYear(userID uint) (map[LeaveType]int, error) {
	return l.GetUserLeaveBalanceByType(userID, time.Now().Year())
}

// CheckLeaveOverlap checks if there are overlapping leave requests
func (l *LeaveRequestModel) CheckLeaveOverlap(userID uint, startDate, endDate time.Time, excludeID *uint) (bool, error) {
	var count int64
	query := l.db.Model(&LeaveRequest{}).Where("user_id = ? AND status IN ? AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))",
		userID, []LeaveRequestStatus{StatusPending, StatusTeamLeadApproved, StatusHRApproved, StatusManagementApproved, StatusApproved},
		endDate, startDate, startDate, endDate)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	if err := query.Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

// ValidateLeaveRequest validates a leave request before creation
func (l *LeaveRequestModel) ValidateLeaveRequest(request *LeaveRequest) error {
	// Check if start date is not in the past
	if request.StartDate.Before(time.Now().Truncate(24 * time.Hour)) {
		return fmt.Errorf("start date cannot be in the past")
	}

	// Check if end date is after start date
	if request.EndDate.Before(request.StartDate) {
		return fmt.Errorf("end date must be after start date")
	}

	// Check for overlapping leave requests
	hasOverlap, err := l.CheckLeaveOverlap(request.UserID, request.StartDate, request.EndDate, nil)
	if err != nil {
		return err
	}
	if hasOverlap {
		return fmt.Errorf("leave request overlaps with existing approved or pending leave")
	}

	// Calculate days requested
	request.DaysRequested = int(request.EndDate.Sub(request.StartDate).Hours()/24) + 1

	return nil
}

// GetLeaveRequestsByYear retrieves leave requests for a specific year
func (l *LeaveRequestModel) GetLeaveRequestsByYear(userID uint, year int) ([]LeaveRequest, error) {
	var requests []LeaveRequest
	startOfYear := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	endOfYear := time.Date(year, 12, 31, 23, 59, 59, 999999999, time.UTC)

	if err := l.db.Where("user_id = ? AND start_date >= ? AND start_date <= ?",
		userID, startOfYear, endOfYear).
		Preload("User").Preload("TeamLead").
		Order("start_date DESC").
		Find(&requests).Error; err != nil {
		return nil, err
	}

	return requests, nil
}

// GetTeamLeaveRequests retrieves leave requests for all team members
func (l *LeaveRequestModel) GetTeamLeaveRequests(teamLeadID uint, year int) ([]LeaveRequest, error) {
	var requests []LeaveRequest
	startOfYear := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	endOfYear := time.Date(year, 12, 31, 23, 59, 59, 999999999, time.UTC)

	// Get team members first
	userModel := NewUserModel(l.db)
	teamMembers, err := userModel.GetUsersByTeam(teamLeadID)
	if err != nil {
		return nil, err
	}

	var userIDs []uint
	for _, member := range teamMembers {
		userIDs = append(userIDs, member.ID)
	}

	if err := l.db.Where("user_id IN ? AND start_date >= ? AND start_date <= ?",
		userIDs, startOfYear, endOfYear).
		Preload("User").Preload("TeamLead").
		Order("start_date DESC").
		Find(&requests).Error; err != nil {
		return nil, err
	}

	return requests, nil
}

// ProcessLeaveRequestWorkflow processes the approval workflow for a leave request
func (l *LeaveRequestModel) ProcessLeaveRequestWorkflow(requestID uint, approverID uint, action string, comments string) error {
	// Get the leave request
	request, err := l.GetLeaveRequest(requestID)
	if err != nil {
		return err
	}

	// Determine the next step based on current status and action
	switch request.Status {
	case StatusPending:
		if action == "approve" {
			// Check if user is team lead
			userModel := NewUserModel(l.db)
			isTeamLead, err := userModel.IsUserTeamLead(approverID)
			if err != nil {
				return err
			}

			if isTeamLead && request.TeamLeadID != nil && *request.TeamLeadID == approverID {
				// Team lead approval
				return l.ApproveByTeamLead(requestID, approverID, comments)
			}
		} else if action == "reject" {
			// Check if user is team lead
			userModel := NewUserModel(l.db)
			isTeamLead, err := userModel.IsUserTeamLead(approverID)
			if err != nil {
				return err
			}

			if isTeamLead && request.TeamLeadID != nil && *request.TeamLeadID == approverID {
				// Team lead rejection
				return l.RejectByTeamLead(requestID, approverID, comments)
			}
		}

	case StatusTeamLeadApproved:
		if action == "approve" {
			// Check if user has HR permission
			userModel := NewUserModel(l.db)
			hasHRPermission, err := userModel.HasUserPermission(approverID, "APPROVE_LEAVE_HR")
			if err != nil {
				return err
			}

			if hasHRPermission {
				// Check if management approval is required (> 4 days)
				if request.DaysRequested > 4 {
					// HR approval, but management approval still needed
					return l.ApproveByHR(requestID, comments)
				} else {
					// HR approval is final
					return l.ApproveByHR(requestID, comments)
				}
			}
		} else if action == "reject" {
			// Check if user has HR permission
			userModel := NewUserModel(l.db)
			hasHRPermission, err := userModel.HasUserPermission(approverID, "APPROVE_LEAVE_HR")
			if err != nil {
				return err
			}

			if hasHRPermission {
				return l.RejectByHR(requestID, comments)
			}
		}

	case StatusHRApproved:
		if action == "approve" {
			// Check if user has management permission
			userModel := NewUserModel(l.db)
			hasManagementPermission, err := userModel.HasUserPermission(approverID, "APPROVE_LEAVE_MANAGEMENT")
			if err != nil {
				return err
			}

			if hasManagementPermission {
				// Management approval - final approval
				return l.ApproveByManagement(requestID, comments)
			}
		} else if action == "reject" {
			// Check if user has management permission
			userModel := NewUserModel(l.db)
			hasManagementPermission, err := userModel.HasUserPermission(approverID, "APPROVE_LEAVE_MANAGEMENT")
			if err != nil {
				return err
			}

			if hasManagementPermission {
				return l.RejectByManagement(requestID, comments)
			}
		}
	}

	return fmt.Errorf("invalid action or insufficient permissions")
}

// GetLeaveRequestWorkflowStatus returns the current workflow status and next approver
func (l *LeaveRequestModel) GetLeaveRequestWorkflowStatus(requestID uint) (map[string]interface{}, error) {
	request, err := l.GetLeaveRequest(requestID)
	if err != nil {
		return nil, err
	}

	status := map[string]interface{}{
		"current_status":      request.Status,
		"next_approver":       nil,
		"is_final":            false,
		"requires_management": false,
	}

	switch request.Status {
	case StatusPending:
		if request.TeamLeadID != nil {
			status["next_approver"] = "team_lead"
		} else {
			status["next_approver"] = "hr"
		}

	case StatusTeamLeadApproved:
		status["next_approver"] = "hr"
		if request.DaysRequested > 4 {
			status["requires_management"] = true
		}

	case StatusHRApproved:
		if request.DaysRequested > 4 {
			status["next_approver"] = "management"
		} else {
			status["is_final"] = true
		}

	case StatusManagementApproved:
		status["is_final"] = true

	case StatusApproved:
		status["is_final"] = true

	case StatusRejected, StatusCancelled:
		status["is_final"] = true
	}

	return status, nil
}

// GetLeaveRequestTimeline returns the approval timeline for a leave request
func (l *LeaveRequestModel) GetLeaveRequestTimeline(requestID uint) ([]map[string]interface{}, error) {
	request, err := l.GetLeaveRequest(requestID)
	if err != nil {
		return nil, err
	}

	timeline := []map[string]interface{}{}

	// Request submitted
	timeline = append(timeline, map[string]interface{}{
		"action":    "submitted",
		"timestamp": request.CreatedAt,
		"user_id":   request.UserID,
		"user_name": request.User.FirstName + " " + request.User.LastName,
		"comments":  "",
	})

	// Team lead approval/rejection
	if request.TeamLeadApprovedAt != nil {
		action := "approved"
		if request.Status == StatusRejected {
			action = "rejected"
		}

		timeline = append(timeline, map[string]interface{}{
			"action":    action,
			"timestamp": *request.TeamLeadApprovedAt,
			"user_id":   *request.TeamLeadID,
			"user_name": request.TeamLead.FirstName + " " + request.TeamLead.LastName,
			"comments":  request.TeamLeadComments,
			"level":     "team_lead",
		})
	}

	// HR approval/rejection
	if request.HRApprovedAt != nil {
		action := "approved"
		if request.Status == StatusRejected {
			action = "rejected"
		}

		timeline = append(timeline, map[string]interface{}{
			"action":    action,
			"timestamp": *request.HRApprovedAt,
			"user_id":   0, // HR user ID would need to be stored
			"user_name": "HR",
			"comments":  request.HRComments,
			"level":     "hr",
		})
	}

	// Management approval/rejection
	if request.ManagementApprovedAt != nil {
		action := "approved"
		if request.Status == StatusRejected {
			action = "rejected"
		}

		timeline = append(timeline, map[string]interface{}{
			"action":    action,
			"timestamp": *request.ManagementApprovedAt,
			"user_id":   0, // Management user ID would need to be stored
			"user_name": "Management",
			"comments":  request.ManagementComments,
			"level":     "management",
		})
	}

	return timeline, nil
}

// GetLeaveRequestSummary returns a summary of leave requests for reporting
func (l *LeaveRequestModel) GetLeaveRequestSummary(year int) (map[string]interface{}, error) {
	startOfYear := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	endOfYear := time.Date(year, 12, 31, 23, 59, 59, 999999999, time.UTC)

	summary := map[string]interface{}{
		"year":           year,
		"total_requests": 0,
		"by_status":      make(map[string]int),
		"by_type":        make(map[string]int),
		"by_month":       make(map[int]int),
	}

	// Get all requests for the year
	var requests []LeaveRequest
	if err := l.db.Where("start_date >= ? AND start_date <= ?", startOfYear, endOfYear).
		Preload("User").Preload("TeamLead").
		Find(&requests).Error; err != nil {
		return nil, err
	}

	summary["total_requests"] = len(requests)

	// Count by status
	statusCounts := make(map[string]int)
	for _, request := range requests {
		statusCounts[string(request.Status)]++
	}
	summary["by_status"] = statusCounts

	// Count by type
	typeCounts := make(map[string]int)
	for _, request := range requests {
		typeCounts[string(request.LeaveType)]++
	}
	summary["by_type"] = typeCounts

	// Count by month
	monthCounts := make(map[int]int)
	for _, request := range requests {
		month := int(request.StartDate.Month())
		monthCounts[month]++
	}
	summary["by_month"] = monthCounts

	return summary, nil
}
