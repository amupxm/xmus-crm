package model

import (
	"time"

	"gorm.io/gorm"
)

// LeaveCalendarEntry represents a calendar entry for leave requests
type LeaveCalendarEntry struct {
	ID             uint               `gorm:"primaryKey"`
	LeaveRequestID uint               `gorm:"not null"`
	UserID         uint               `gorm:"not null"`
	LeaveType      LeaveType          `gorm:"not null"`
	Date           time.Time          `gorm:"not null"`
	IsHalfDay      bool               `gorm:"default:false"`
	IsMorning      bool               `gorm:"default:false"` // For half-day leaves
	Status         LeaveRequestStatus `gorm:"not null"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt

	// Relationships
	LeaveRequest LeaveRequest `gorm:"foreignKey:LeaveRequestID"`
	User         User         `gorm:"foreignKey:UserID"`
}

// LeaveCalendarModel handles leave calendar database operations
type LeaveCalendarModel struct {
	db *gorm.DB
}

func NewLeaveCalendarModel(db *gorm.DB) *LeaveCalendarModel {
	return &LeaveCalendarModel{
		db: db,
	}
}

// CreateCalendarEntry creates a calendar entry for a leave request
func (l *LeaveCalendarModel) CreateCalendarEntry(entry *LeaveCalendarEntry) error {
	return l.db.Create(entry).Error
}

// CreateCalendarEntriesForLeaveRequest creates calendar entries for all days in a leave request
func (l *LeaveCalendarModel) CreateCalendarEntriesForLeaveRequest(leaveRequest *LeaveRequest) error {
	// Delete existing entries for this leave request
	if err := l.db.Where("leave_request_id = ?", leaveRequest.ID).Delete(&LeaveCalendarEntry{}).Error; err != nil {
		return err
	}

	// Create entries for each day
	currentDate := leaveRequest.StartDate
	endDate := leaveRequest.EndDate

	for currentDate.Before(endDate) || currentDate.Equal(endDate) {
		entry := &LeaveCalendarEntry{
			LeaveRequestID: leaveRequest.ID,
			UserID:         leaveRequest.UserID,
			LeaveType:      leaveRequest.LeaveType,
			Date:           currentDate,
			IsHalfDay:      false,
			IsMorning:      false,
			Status:         leaveRequest.Status,
		}

		if err := l.db.Create(entry).Error; err != nil {
			return err
		}

		currentDate = currentDate.AddDate(0, 0, 1)
	}

	return nil
}

// GetCalendarEntriesForUser retrieves calendar entries for a user within a date range
func (l *LeaveCalendarModel) GetCalendarEntriesForUser(userID uint, startDate, endDate time.Time) ([]LeaveCalendarEntry, error) {
	var entries []LeaveCalendarEntry
	if err := l.db.Where("user_id = ? AND date >= ? AND date <= ?", userID, startDate, endDate).
		Preload("LeaveRequest").Preload("User").
		Order("date ASC").
		Find(&entries).Error; err != nil {
		return nil, err
	}
	return entries, nil
}

// GetCalendarEntriesForTeam retrieves calendar entries for all team members within a date range
func (l *LeaveCalendarModel) GetCalendarEntriesForTeam(teamLeadID uint, startDate, endDate time.Time) ([]LeaveCalendarEntry, error) {
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

	var entries []LeaveCalendarEntry
	if err := l.db.Where("user_id IN ? AND date >= ? AND date <= ?", userIDs, startDate, endDate).
		Preload("LeaveRequest").Preload("User").
		Order("date ASC").
		Find(&entries).Error; err != nil {
		return nil, err
	}
	return entries, nil
}

// GetCalendarEntriesForMonth retrieves calendar entries for a specific month
func (l *LeaveCalendarModel) GetCalendarEntriesForMonth(userID uint, year int, month int) ([]LeaveCalendarEntry, error) {
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, -1)
	return l.GetCalendarEntriesForUser(userID, startDate, endDate)
}

// GetCalendarEntriesForYear retrieves calendar entries for a specific year
func (l *LeaveCalendarModel) GetCalendarEntriesForYear(userID uint, year int) ([]LeaveCalendarEntry, error) {
	startDate := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(year, 12, 31, 23, 59, 59, 999999999, time.UTC)
	return l.GetCalendarEntriesForUser(userID, startDate, endDate)
}

// GetCalendarEntriesByLeaveType retrieves calendar entries filtered by leave type
func (l *LeaveCalendarModel) GetCalendarEntriesByLeaveType(userID uint, leaveType LeaveType, startDate, endDate time.Time) ([]LeaveCalendarEntry, error) {
	var entries []LeaveCalendarEntry
	if err := l.db.Where("user_id = ? AND leave_type = ? AND date >= ? AND date <= ?", userID, leaveType, startDate, endDate).
		Preload("LeaveRequest").Preload("User").
		Order("date ASC").
		Find(&entries).Error; err != nil {
		return nil, err
	}
	return entries, nil
}

// GetCalendarEntriesByStatus retrieves calendar entries filtered by status
func (l *LeaveCalendarModel) GetCalendarEntriesByStatus(userID uint, status LeaveRequestStatus, startDate, endDate time.Time) ([]LeaveCalendarEntry, error) {
	var entries []LeaveCalendarEntry
	if err := l.db.Where("user_id = ? AND status = ? AND date >= ? AND date <= ?", userID, status, startDate, endDate).
		Preload("LeaveRequest").Preload("User").
		Order("date ASC").
		Find(&entries).Error; err != nil {
		return nil, err
	}
	return entries, nil
}

// UpdateCalendarEntryStatus updates the status of calendar entries for a leave request
func (l *LeaveCalendarModel) UpdateCalendarEntryStatus(leaveRequestID uint, status LeaveRequestStatus) error {
	return l.db.Model(&LeaveCalendarEntry{}).
		Where("leave_request_id = ?", leaveRequestID).
		Update("status", status).Error
}

// DeleteCalendarEntriesForLeaveRequest deletes calendar entries for a leave request
func (l *LeaveCalendarModel) DeleteCalendarEntriesForLeaveRequest(leaveRequestID uint) error {
	return l.db.Where("leave_request_id = ?", leaveRequestID).Delete(&LeaveCalendarEntry{}).Error
}

// GetCalendarStats returns calendar statistics for a user
func (l *LeaveCalendarModel) GetCalendarStats(userID uint, year int) (map[string]interface{}, error) {
	startDate := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(year, 12, 31, 23, 59, 59, 999999999, time.UTC)

	stats := make(map[string]interface{})

	// Total days on leave
	var totalDays int64
	if err := l.db.Model(&LeaveCalendarEntry{}).
		Where("user_id = ? AND date >= ? AND date <= ? AND status = ?", userID, startDate, endDate, StatusApproved).
		Count(&totalDays).Error; err != nil {
		return nil, err
	}
	stats["total_days_on_leave"] = totalDays

	// Days by leave type
	leaveTypes := []LeaveType{LeaveTypeAnnual, LeaveTypeSick, LeaveTypePersonal, LeaveTypeEmergency, LeaveTypeMaternity, LeaveTypePaternity, LeaveTypeUnpaid}
	daysByType := make(map[LeaveType]int64)

	for _, leaveType := range leaveTypes {
		var count int64
		if err := l.db.Model(&LeaveCalendarEntry{}).
			Where("user_id = ? AND leave_type = ? AND date >= ? AND date <= ? AND status = ?", userID, leaveType, startDate, endDate, StatusApproved).
			Count(&count).Error; err != nil {
			return nil, err
		}
		daysByType[leaveType] = count
	}
	stats["days_by_type"] = daysByType

	// Days by month
	daysByMonth := make(map[int]int64)
	for month := 1; month <= 12; month++ {
		monthStart := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		monthEnd := monthStart.AddDate(0, 1, -1)

		var count int64
		if err := l.db.Model(&LeaveCalendarEntry{}).
			Where("user_id = ? AND date >= ? AND date <= ? AND status = ?", userID, monthStart, monthEnd, StatusApproved).
			Count(&count).Error; err != nil {
			return nil, err
		}
		daysByMonth[month] = count
	}
	stats["days_by_month"] = daysByMonth

	// Pending days
	var pendingDays int64
	if err := l.db.Model(&LeaveCalendarEntry{}).
		Where("user_id = ? AND date >= ? AND date <= ? AND status IN ?", userID, startDate, endDate, []LeaveRequestStatus{StatusPending, StatusTeamLeadApproved, StatusHRApproved, StatusManagementApproved}).
		Count(&pendingDays).Error; err != nil {
		return nil, err
	}
	stats["pending_days"] = pendingDays

	return stats, nil
}

// GetTeamCalendarStats returns calendar statistics for a team
func (l *LeaveCalendarModel) GetTeamCalendarStats(teamLeadID uint, year int) (map[string]interface{}, error) {
	startDate := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(year, 12, 31, 23, 59, 59, 999999999, time.UTC)

	// Get team members
	userModel := NewUserModel(l.db)
	teamMembers, err := userModel.GetUsersByTeam(teamLeadID)
	if err != nil {
		return nil, err
	}

	var userIDs []uint
	for _, member := range teamMembers {
		userIDs = append(userIDs, member.ID)
	}

	stats := make(map[string]interface{})

	// Total team days on leave
	var totalDays int64
	if err := l.db.Model(&LeaveCalendarEntry{}).
		Where("user_id IN ? AND date >= ? AND date <= ? AND status = ?", userIDs, startDate, endDate, StatusApproved).
		Count(&totalDays).Error; err != nil {
		return nil, err
	}
	stats["total_team_days_on_leave"] = totalDays

	// Team utilization by month
	teamUtilizationByMonth := make(map[int]int64)
	for month := 1; month <= 12; month++ {
		monthStart := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		monthEnd := monthStart.AddDate(0, 1, -1)

		var count int64
		if err := l.db.Model(&LeaveCalendarEntry{}).
			Where("user_id IN ? AND date >= ? AND date <= ? AND status = ?", userIDs, monthStart, monthEnd, StatusApproved).
			Count(&count).Error; err != nil {
			return nil, err
		}
		teamUtilizationByMonth[month] = count
	}
	stats["team_utilization_by_month"] = teamUtilizationByMonth

	return stats, nil
}

// CheckDateAvailability checks if a date is available for leave
func (l *LeaveCalendarModel) CheckDateAvailability(userID uint, date time.Time) (bool, error) {
	var count int64
	if err := l.db.Model(&LeaveCalendarEntry{}).
		Where("user_id = ? AND date = ? AND status IN ?", userID, date, []LeaveRequestStatus{StatusPending, StatusTeamLeadApproved, StatusHRApproved, StatusManagementApproved, StatusApproved}).
		Count(&count).Error; err != nil {
		return false, err
	}
	return count == 0, nil
}

// GetAvailableDates returns available dates for leave within a range
func (l *LeaveCalendarModel) GetAvailableDates(userID uint, startDate, endDate time.Time) ([]time.Time, error) {
	var availableDates []time.Time
	currentDate := startDate

	for currentDate.Before(endDate) || currentDate.Equal(endDate) {
		available, err := l.CheckDateAvailability(userID, currentDate)
		if err != nil {
			return nil, err
		}
		if available {
			availableDates = append(availableDates, currentDate)
		}
		currentDate = currentDate.AddDate(0, 0, 1)
	}

	return availableDates, nil
}
