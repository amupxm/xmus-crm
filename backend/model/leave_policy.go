package model

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// LeavePolicy represents leave policies and rules for the organization
type LeavePolicy struct {
	ID                 uint      `gorm:"primaryKey"`
	LeaveType          LeaveType `gorm:"not null"`
	Year               int       `gorm:"not null"`
	DefaultAllocation  int       `gorm:"not null;default:0"`  // Default days allocated per user
	MaxAllocation      int       `gorm:"not null;default:0"`  // Maximum days that can be allocated
	MinNoticeDays      int       `gorm:"not null;default:1"`  // Minimum notice required in days
	MaxConsecutiveDays int       `gorm:"not null;default:30"` // Maximum consecutive days allowed
	AllowCarryOver     bool      `gorm:"default:true"`        // Whether carry-over is allowed
	MaxCarryOver       int       `gorm:"not null;default:0"`  // Maximum days that can be carried over
	RequiresApproval   bool      `gorm:"default:true"`        // Whether this leave type requires approval
	IsActive           bool      `gorm:"default:true"`        // Whether this policy is active
	Description        string    `gorm:"type:text"`           // Policy description
	CreatedAt          time.Time
	UpdatedAt          time.Time
	DeletedAt          gorm.DeletedAt
}

// LeavePolicyModel handles leave policy database operations
type LeavePolicyModel struct {
	db *gorm.DB
}

func NewLeavePolicyModel(db *gorm.DB) *LeavePolicyModel {
	return &LeavePolicyModel{
		db: db,
	}
}

// CreateLeavePolicy creates a new leave policy
func (l *LeavePolicyModel) CreateLeavePolicy(policy *LeavePolicy) error {
	return l.db.Create(policy).Error
}

// GetLeavePolicy retrieves a leave policy by ID
func (l *LeavePolicyModel) GetLeavePolicy(id uint) (*LeavePolicy, error) {
	var policy LeavePolicy
	if err := l.db.First(&policy, id).Error; err != nil {
		return nil, err
	}
	return &policy, nil
}

// GetLeavePoliciesByYear retrieves all leave policies for a specific year
func (l *LeavePolicyModel) GetLeavePoliciesByYear(year int) ([]LeavePolicy, error) {
	var policies []LeavePolicy
	if err := l.db.Where("year = ? AND is_active = ?", year, true).
		Order("leave_type ASC").
		Find(&policies).Error; err != nil {
		return nil, err
	}
	return policies, nil
}

// GetLeavePolicyByTypeAndYear retrieves a leave policy for a specific type and year
func (l *LeavePolicyModel) GetLeavePolicyByTypeAndYear(leaveType LeaveType, year int) (*LeavePolicy, error) {
	var policy LeavePolicy
	if err := l.db.Where("leave_type = ? AND year = ? AND is_active = ?", leaveType, year, true).
		First(&policy).Error; err != nil {
		return nil, err
	}
	return &policy, nil
}

// UpdateLeavePolicy updates a leave policy
func (l *LeavePolicyModel) UpdateLeavePolicy(policy *LeavePolicy) error {
	return l.db.Save(policy).Error
}

// DeleteLeavePolicy soft deletes a leave policy
func (l *LeavePolicyModel) DeleteLeavePolicy(id uint) error {
	return l.db.Delete(&LeavePolicy{}, id).Error
}

// DeactivateLeavePolicy deactivates a leave policy
func (l *LeavePolicyModel) DeactivateLeavePolicy(id uint) error {
	return l.db.Model(&LeavePolicy{}).Where("id = ?", id).Update("is_active", false).Error
}

// InitializeDefaultPolicies creates default leave policies for a year
func (l *LeavePolicyModel) InitializeDefaultPolicies(year int) error {
	// Check if policies already exist for this year
	var count int64
	if err := l.db.Model(&LeavePolicy{}).Where("year = ?", year).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		return nil // Policies already exist
	}

	// Default policies
	policies := []LeavePolicy{
		{
			LeaveType:          LeaveTypeAnnual,
			Year:               year,
			DefaultAllocation:  20, // 20 days annual leave
			MaxAllocation:      30,
			MinNoticeDays:      7,  // 1 week notice
			MaxConsecutiveDays: 15, // Max 15 consecutive days
			AllowCarryOver:     true,
			MaxCarryOver:       5, // Max 5 days carry-over
			RequiresApproval:   true,
			IsActive:           true,
			Description:        "Annual vacation leave policy",
		},
		{
			LeaveType:          LeaveTypeSick,
			Year:               year,
			DefaultAllocation:  10, // 10 days sick leave
			MaxAllocation:      15,
			MinNoticeDays:      0,     // No notice required for sick leave
			MaxConsecutiveDays: 5,     // Max 5 consecutive days without medical certificate
			AllowCarryOver:     false, // Sick leave doesn't carry over
			MaxCarryOver:       0,
			RequiresApproval:   true,
			IsActive:           true,
			Description:        "Sick leave policy",
		},
		{
			LeaveType:          LeaveTypePersonal,
			Year:               year,
			DefaultAllocation:  5, // 5 days personal leave
			MaxAllocation:      10,
			MinNoticeDays:      3, // 3 days notice
			MaxConsecutiveDays: 3, // Max 3 consecutive days
			AllowCarryOver:     false,
			MaxCarryOver:       0,
			RequiresApproval:   true,
			IsActive:           true,
			Description:        "Personal leave policy",
		},
		{
			LeaveType:          LeaveTypeEmergency,
			Year:               year,
			DefaultAllocation:  3, // 3 days emergency leave
			MaxAllocation:      5,
			MinNoticeDays:      0, // No notice required for emergency
			MaxConsecutiveDays: 3, // Max 3 consecutive days
			AllowCarryOver:     false,
			MaxCarryOver:       0,
			RequiresApproval:   true,
			IsActive:           true,
			Description:        "Emergency leave policy",
		},
		{
			LeaveType:          LeaveTypeMaternity,
			Year:               year,
			DefaultAllocation:  90, // 90 days maternity leave
			MaxAllocation:      120,
			MinNoticeDays:      30, // 30 days notice
			MaxConsecutiveDays: 90, // Max 90 consecutive days
			AllowCarryOver:     false,
			MaxCarryOver:       0,
			RequiresApproval:   true,
			IsActive:           true,
			Description:        "Maternity leave policy",
		},
		{
			LeaveType:          LeaveTypePaternity,
			Year:               year,
			DefaultAllocation:  15, // 15 days paternity leave
			MaxAllocation:      30,
			MinNoticeDays:      14, // 14 days notice
			MaxConsecutiveDays: 15, // Max 15 consecutive days
			AllowCarryOver:     false,
			MaxCarryOver:       0,
			RequiresApproval:   true,
			IsActive:           true,
			Description:        "Paternity leave policy",
		},
		{
			LeaveType:          LeaveTypeUnpaid,
			Year:               year,
			DefaultAllocation:  0,  // No default allocation for unpaid leave
			MaxAllocation:      30, // Max 30 days unpaid leave
			MinNoticeDays:      14, // 14 days notice
			MaxConsecutiveDays: 30, // Max 30 consecutive days
			AllowCarryOver:     false,
			MaxCarryOver:       0,
			RequiresApproval:   true,
			IsActive:           true,
			Description:        "Unpaid leave policy",
		},
	}

	// Create all policies
	for _, policy := range policies {
		if err := l.db.Create(&policy).Error; err != nil {
			return err
		}
	}

	return nil
}

// CopyPoliciesFromPreviousYear copies policies from the previous year
func (l *LeavePolicyModel) CopyPoliciesFromPreviousYear(fromYear, toYear int) error {
	// Get policies from previous year
	policies, err := l.GetLeavePoliciesByYear(fromYear)
	if err != nil {
		return err
	}

	// Create new policies for the new year
	for _, policy := range policies {
		newPolicy := policy
		newPolicy.ID = 0 // Reset ID for new record
		newPolicy.Year = toYear
		newPolicy.CreatedAt = time.Now()
		newPolicy.UpdatedAt = time.Now()
		newPolicy.DeletedAt = gorm.DeletedAt{}

		if err := l.db.Create(&newPolicy).Error; err != nil {
			return err
		}
	}

	return nil
}

// GetActiveLeaveTypes returns all active leave types for a year
func (l *LeavePolicyModel) GetActiveLeaveTypes(year int) ([]LeaveType, error) {
	var leaveTypes []LeaveType
	if err := l.db.Model(&LeavePolicy{}).
		Where("year = ? AND is_active = ?", year, true).
		Distinct("leave_type").
		Pluck("leave_type", &leaveTypes).Error; err != nil {
		return nil, err
	}
	return leaveTypes, nil
}

// ValidateLeaveRequestAgainstPolicy validates a leave request against the policy
func (l *LeavePolicyModel) ValidateLeaveRequestAgainstPolicy(request *LeaveRequest) error {
	policy, err := l.GetLeavePolicyByTypeAndYear(request.LeaveType, request.StartDate.Year())
	if err != nil {
		return err
	}

	// Check if leave type requires approval
	if policy.RequiresApproval && request.Status == StatusPending {
		// This is handled by the approval workflow
	}

	// Check minimum notice period
	if policy.MinNoticeDays > 0 {
		noticeDays := int(time.Until(request.StartDate).Hours() / 24)
		if noticeDays < policy.MinNoticeDays {
			return fmt.Errorf("insufficient notice period: %d days required, %d days provided", policy.MinNoticeDays, noticeDays)
		}
	}

	// Check maximum consecutive days
	if request.DaysRequested > policy.MaxConsecutiveDays {
		return fmt.Errorf("exceeds maximum consecutive days: %d days allowed, %d days requested", policy.MaxConsecutiveDays, request.DaysRequested)
	}

	return nil
}

// GetLeavePolicyStats returns statistics about leave policies
func (l *LeavePolicyModel) GetLeavePolicyStats(year int) (map[string]interface{}, error) {
	var policies []LeavePolicy
	if err := l.db.Where("year = ? AND is_active = ?", year, true).Find(&policies).Error; err != nil {
		return nil, err
	}

	stats := map[string]interface{}{
		"total_policies":     len(policies),
		"total_allocations":  0,
		"active_leave_types": make([]string, 0),
	}

	for _, policy := range policies {
		stats["total_allocations"] = stats["total_allocations"].(int) + policy.DefaultAllocation
		stats["active_leave_types"] = append(stats["active_leave_types"].([]string), string(policy.LeaveType))
	}

	return stats, nil
}
