package model

import (
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
