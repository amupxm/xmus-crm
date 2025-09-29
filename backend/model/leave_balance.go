package model

import (
	"time"

	"gorm.io/gorm"
)

// LeaveBalance represents a user's leave balance for a specific year and leave type
type LeaveBalance struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	UserID         uint           `gorm:"not null" json:"user_id"`
	LeaveType      LeaveType      `gorm:"not null" json:"leave_type"`
	Year           int            `gorm:"not null" json:"year"`
	TotalAllocated int            `gorm:"not null;default:0" json:"total_allocated"` // Total days allocated for this leave type
	UsedDays       int            `gorm:"not null;default:0" json:"used_days"`       // Days used this year
	RemainingDays  int            `gorm:"not null;default:0" json:"remaining_days"`  // Remaining days (calculated)
	CarryOverDays  int            `gorm:"not null;default:0" json:"carry_over_days"` // Days carried over from previous year
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at,omitempty"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// LeaveBalanceModel handles leave balance database operations
type LeaveBalanceModel struct {
	db *gorm.DB
}

func NewLeaveBalanceModel(db *gorm.DB) *LeaveBalanceModel {
	return &LeaveBalanceModel{
		db: db,
	}
}

// CreateLeaveBalance creates a new leave balance record
func (l *LeaveBalanceModel) CreateLeaveBalance(balance *LeaveBalance) error {
	// Calculate remaining days
	balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays
	return l.db.Create(balance).Error
}

// GetUserLeaveBalance retrieves leave balance for a user and year
func (l *LeaveBalanceModel) GetUserLeaveBalance(userID uint, year int) ([]LeaveBalance, error) {
	var balances []LeaveBalance
	if err := l.db.Where("user_id = ? AND year = ?", userID, year).
		Preload("User").
		Find(&balances).Error; err != nil {
		return nil, err
	}
	return balances, nil
}

// GetUserLeaveBalanceByType retrieves leave balance for a specific user, year, and leave type
func (l *LeaveBalanceModel) GetUserLeaveBalanceByType(userID uint, year int, leaveType LeaveType) (*LeaveBalance, error) {
	var balance LeaveBalance
	if err := l.db.Where("user_id = ? AND year = ? AND leave_type = ?", userID, year, leaveType).
		Preload("User").
		First(&balance).Error; err != nil {
		return nil, err
	}
	return &balance, nil
}

// UpdateLeaveBalance updates a leave balance record
func (l *LeaveBalanceModel) UpdateLeaveBalance(balance *LeaveBalance) error {
	// Recalculate remaining days
	balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays
	return l.db.Save(balance).Error
}

// IncrementUsedDays increments the used days for a leave balance
func (l *LeaveBalanceModel) IncrementUsedDays(userID uint, year int, leaveType LeaveType, days int) error {
	balance, err := l.GetUserLeaveBalanceByType(userID, year, leaveType)
	if err != nil {
		return err
	}

	balance.UsedDays += days
	balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

	return l.db.Save(balance).Error
}

// DecrementUsedDays decrements the used days for a leave balance
func (l *LeaveBalanceModel) DecrementUsedDays(userID uint, year int, leaveType LeaveType, days int) error {
	balance, err := l.GetUserLeaveBalanceByType(userID, year, leaveType)
	if err != nil {
		return err
	}

	if balance.UsedDays >= days {
		balance.UsedDays -= days
	} else {
		balance.UsedDays = 0
	}

	balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

	return l.db.Save(balance).Error
}

// InitializeUserLeaveBalances initializes leave balances for a user for a specific year
func (l *LeaveBalanceModel) InitializeUserLeaveBalances(userID uint, year int) error {
	// Get leave policies for the year
	policyModel := NewLeavePolicyModel(l.db)
	policies, err := policyModel.GetLeavePoliciesByYear(year)
	if err != nil {
		return err
	}

	// Create balance records for each leave type
	for _, policy := range policies {
		// Check if balance already exists
		var existingBalance LeaveBalance
		err := l.db.Where("user_id = ? AND year = ? AND leave_type = ?", userID, year, policy.LeaveType).
			First(&existingBalance).Error

		if err == gorm.ErrRecordNotFound {
			// Create new balance
			balance := &LeaveBalance{
				UserID:         userID,
				LeaveType:      policy.LeaveType,
				Year:           year,
				TotalAllocated: policy.DefaultAllocation,
				UsedDays:       0,
				CarryOverDays:  0,
			}
			balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

			if err := l.db.Create(balance).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

// GetLeaveBalanceSummary returns a summary of leave balances for a user
func (l *LeaveBalanceModel) GetLeaveBalanceSummary(userID uint, year int) (map[LeaveType]LeaveBalance, error) {
	balances, err := l.GetUserLeaveBalance(userID, year)
	if err != nil {
		return nil, err
	}

	summary := make(map[LeaveType]LeaveBalance)
	for _, balance := range balances {
		summary[balance.LeaveType] = balance
	}

	return summary, nil
}

// ResetLeaveBalancesForNewYear resets leave balances for a new year with carry-over rules
func (l *LeaveBalanceModel) ResetLeaveBalancesForNewYear(userID uint, newYear int) error {
	// Get previous year's balances
	prevYear := newYear - 1
	prevBalances, err := l.GetUserLeaveBalance(userID, prevYear)
	if err != nil {
		return err
	}

	// Get leave policies for the new year
	policyModel := NewLeavePolicyModel(l.db)
	policies, err := policyModel.GetLeavePoliciesByYear(newYear)
	if err != nil {
		return err
	}

	// Create new balances with carry-over
	for _, policy := range policies {
		var carryOverDays int

		// Find previous year's balance for this leave type
		for _, prevBalance := range prevBalances {
			if prevBalance.LeaveType == policy.LeaveType {
				// Apply carry-over rules
				if policy.AllowCarryOver && prevBalance.RemainingDays > 0 {
					if policy.MaxCarryOver > 0 && prevBalance.RemainingDays > policy.MaxCarryOver {
						carryOverDays = policy.MaxCarryOver
					} else {
						carryOverDays = prevBalance.RemainingDays
					}
				}
				break
			}
		}

		// Create new balance
		balance := &LeaveBalance{
			UserID:         userID,
			LeaveType:      policy.LeaveType,
			Year:           newYear,
			TotalAllocated: policy.DefaultAllocation,
			UsedDays:       0,
			CarryOverDays:  carryOverDays,
		}
		balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

		if err := l.db.Create(balance).Error; err != nil {
			return err
		}
	}

	return nil
}

// GetUsersWithLowLeaveBalance returns users with low leave balance
func (l *LeaveBalanceModel) GetUsersWithLowLeaveBalance(year int, threshold int) ([]LeaveBalance, error) {
	var balances []LeaveBalance
	if err := l.db.Where("year = ? AND remaining_days <= ?", year, threshold).
		Preload("User").
		Find(&balances).Error; err != nil {
		return nil, err
	}
	return balances, nil
}

// GetLeaveUtilizationStats returns leave utilization statistics
func (l *LeaveBalanceModel) GetLeaveUtilizationStats(year int) (map[LeaveType]map[string]int, error) {
	var balances []LeaveBalance
	if err := l.db.Where("year = ?", year).Find(&balances).Error; err != nil {
		return nil, err
	}

	stats := make(map[LeaveType]map[string]int)

	for _, balance := range balances {
		if stats[balance.LeaveType] == nil {
			stats[balance.LeaveType] = make(map[string]int)
		}

		stats[balance.LeaveType]["total_allocated"] += balance.TotalAllocated
		stats[balance.LeaveType]["total_used"] += balance.UsedDays
		stats[balance.LeaveType]["total_remaining"] += balance.RemainingDays
		stats[balance.LeaveType]["total_carryover"] += balance.CarryOverDays
	}

	return stats, nil
}
