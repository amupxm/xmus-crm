package api

import (
	"net/http"
	"strconv"

	"github.com/amupxm/xmus-crm/backend/model"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// LeaveBalanceAdminHandler handles admin leave balance management
type LeaveBalanceAdminHandler struct {
	leaveBalanceModel *model.LeaveBalanceModel
	leavePolicyModel  *model.LeavePolicyModel
	userModel         *model.UserModel
}

// NewLeaveBalanceAdminHandler creates a new admin leave balance handler
func NewLeaveBalanceAdminHandler(db *gorm.DB) *LeaveBalanceAdminHandler {
	return &LeaveBalanceAdminHandler{
		leaveBalanceModel: model.NewLeaveBalanceModel(db),
		leavePolicyModel:  model.NewLeavePolicyModel(db),
		userModel:         model.NewUserModel(db),
	}
}

// UpdateUserLeaveBalanceRequest represents the request body for updating user leave balance
type UpdateUserLeaveBalanceRequest struct {
	UserID         uint   `json:"user_id" binding:"required"`
	LeaveType      string `json:"leave_type" binding:"required"`
	TotalAllocated int    `json:"total_allocated" binding:"required,min=0"`
	CarryOverDays  int    `json:"carry_over_days" binding:"min=0"`
}

// BulkUpdateLeaveBalanceRequest represents the request body for bulk updating leave balances
type BulkUpdateLeaveBalanceRequest struct {
	UserID        uint `json:"user_id" binding:"required"`
	LeaveBalances []struct {
		LeaveType      string `json:"leave_type" binding:"required"`
		TotalAllocated int    `json:"total_allocated" binding:"required,min=0"`
		CarryOverDays  int    `json:"carry_over_days" binding:"min=0"`
	} `json:"leave_balances" binding:"required"`
}

// GetUserLeaveBalances retrieves leave balances for a specific user
func (h *LeaveBalanceAdminHandler) GetUserLeaveBalances(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(2024)) // Default to current year
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
		return
	}

	// Get user info
	user, err := h.userModel.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get leave balances
	balances, err := h.leaveBalanceModel.GetUserLeaveBalance(uint(userID), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve leave balances"})
		return
	}

	// If no balances exist, initialize them
	if len(balances) == 0 {
		err = h.leaveBalanceModel.InitializeUserLeaveBalances(uint(userID), year)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize leave balances"})
			return
		}
		// Get balances again after initialization
		balances, err = h.leaveBalanceModel.GetUserLeaveBalance(uint(userID), year)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve leave balances"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"user":     user,
		"year":     year,
		"balances": balances,
	})
}

// UpdateUserLeaveBalance updates a specific leave balance for a user
func (h *LeaveBalanceAdminHandler) UpdateUserLeaveBalance(c *gin.Context) {
	var req UpdateUserLeaveBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
		return
	}

	// Check if user exists
	_, err = h.userModel.GetUserByID(req.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get or create leave balance
	balance, err := h.leaveBalanceModel.GetUserLeaveBalanceByType(req.UserID, year, model.LeaveType(req.LeaveType))
	if err != nil {
		// Create new balance if it doesn't exist
		balance = &model.LeaveBalance{
			UserID:         req.UserID,
			LeaveType:      model.LeaveType(req.LeaveType),
			Year:           year,
			TotalAllocated: req.TotalAllocated,
			UsedDays:       0,
			CarryOverDays:  req.CarryOverDays,
		}
		balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

		err = h.leaveBalanceModel.CreateLeaveBalance(balance)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create leave balance"})
			return
		}
	} else {
		// Update existing balance
		balance.TotalAllocated = req.TotalAllocated
		balance.CarryOverDays = req.CarryOverDays
		balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

		err = h.leaveBalanceModel.UpdateLeaveBalance(balance)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update leave balance"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Leave balance updated successfully",
		"balance": balance,
	})
}

// BulkUpdateUserLeaveBalances updates multiple leave balances for a user
func (h *LeaveBalanceAdminHandler) BulkUpdateUserLeaveBalances(c *gin.Context) {
	var req BulkUpdateLeaveBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
		return
	}

	// Check if user exists
	_, err = h.userModel.GetUserByID(req.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var updatedBalances []model.LeaveBalance

	// Update each leave balance
	for _, balanceReq := range req.LeaveBalances {
		balance, err := h.leaveBalanceModel.GetUserLeaveBalanceByType(req.UserID, year, model.LeaveType(balanceReq.LeaveType))
		if err != nil {
			// Create new balance
			balance = &model.LeaveBalance{
				UserID:         req.UserID,
				LeaveType:      model.LeaveType(balanceReq.LeaveType),
				Year:           year,
				TotalAllocated: balanceReq.TotalAllocated,
				UsedDays:       0,
				CarryOverDays:  balanceReq.CarryOverDays,
			}
			balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

			err = h.leaveBalanceModel.CreateLeaveBalance(balance)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create leave balance"})
				return
			}
		} else {
			// Update existing balance
			balance.TotalAllocated = balanceReq.TotalAllocated
			balance.CarryOverDays = balanceReq.CarryOverDays
			balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

			err = h.leaveBalanceModel.UpdateLeaveBalance(balance)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update leave balance"})
				return
			}
		}

		updatedBalances = append(updatedBalances, *balance)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Leave balances updated successfully",
		"balances": updatedBalances,
	})
}

// GetAllUsersLeaveBalances retrieves leave balances for all users
func (h *LeaveBalanceAdminHandler) GetAllUsersLeaveBalances(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
		return
	}

	// Get all users
	users, err := h.userModel.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}

	var result []gin.H
	for _, user := range users {
		balances, err := h.leaveBalanceModel.GetUserLeaveBalance(user.ID, year)
		if err != nil {
			// Initialize balances if they don't exist
			err = h.leaveBalanceModel.InitializeUserLeaveBalances(user.ID, year)
			if err != nil {
				continue // Skip this user if initialization fails
			}
			balances, _ = h.leaveBalanceModel.GetUserLeaveBalance(user.ID, year)
		}

		result = append(result, gin.H{
			"user":     user,
			"balances": balances,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"year": year,
		"data": result,
	})
}

// ResetUserLeaveBalances resets leave balances for a user for a new year
func (h *LeaveBalanceAdminHandler) ResetUserLeaveBalances(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
		return
	}

	// Check if user exists
	_, err = h.userModel.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Reset balances for the new year
	err = h.leaveBalanceModel.ResetLeaveBalancesForNewYear(uint(userID), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset leave balances"})
		return
	}

	// Get updated balances
	balances, err := h.leaveBalanceModel.GetUserLeaveBalance(uint(userID), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated balances"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Leave balances reset successfully",
		"balances": balances,
	})
}

// GetLeaveBalanceStats retrieves leave balance statistics
func (h *LeaveBalanceAdminHandler) GetLeaveBalanceStats(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year parameter"})
		return
	}

	stats, err := h.leaveBalanceModel.GetLeaveUtilizationStats(year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"year":  year,
		"stats": stats,
	})
}
