package api

import (
	"net/http"
	"strconv"
	"time"

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

//---------- REQUEST RESPONSE TYPES ----------

// LeaveBalanceResponse represents a leave balance in API responses
type LeaveBalanceResponse struct {
	ID             uint      `json:"id"`
	UserID         uint      `json:"user_id"`
	LeaveType      string    `json:"leave_type"`
	Year           int       `json:"year"`
	TotalAllocated int       `json:"total_allocated"`
	UsedDays       int       `json:"used_days"`
	RemainingDays  int       `json:"remaining_days"`
	CarryOverDays  int       `json:"carry_over_days"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// UserInfo represents basic user information in leave balance responses
type UserInfo struct {
	ID        uint   `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	IsActive  bool   `json:"is_active"`
}

// UserLeaveBalanceResponse represents a user with their leave balances
type UserLeaveBalanceResponse struct {
	User     UserInfo               `json:"user"`
	Year     int                    `json:"year"`
	Balances []LeaveBalanceResponse `json:"balances"`
}

// LeaveBalanceDetailResponse represents a single leave balance response
type LeaveBalanceDetailResponse struct {
	Success bool                 `json:"success"`
	Message string               `json:"message"`
	Data    LeaveBalanceResponse `json:"data,omitempty"`
}

// UserLeaveBalanceDetailResponse represents a user's leave balance response
type UserLeaveBalanceDetailResponse struct {
	Success bool                     `json:"success"`
	Message string                   `json:"message"`
	Data    UserLeaveBalanceResponse `json:"data,omitempty"`
}

// LeaveBalanceListResponse represents a list of leave balance responses
type LeaveBalanceListResponse struct {
	Success bool                       `json:"success"`
	Message string                     `json:"message"`
	Data    []UserLeaveBalanceResponse `json:"data,omitempty"`
	Meta    struct {
		Year  int `json:"year"`
		Total int `json:"total"`
	} `json:"meta,omitempty"`
}

// LeaveBalanceStatsResponse represents leave balance statistics
type LeaveBalanceStatsResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

//---------- HELPER FUNCTIONS ----------

// convertToLeaveBalanceResponse converts a model.LeaveBalance to LeaveBalanceResponse
func convertToLeaveBalanceResponse(balance model.LeaveBalance) LeaveBalanceResponse {
	return LeaveBalanceResponse{
		ID:             balance.ID,
		UserID:         balance.UserID,
		LeaveType:      string(balance.LeaveType),
		Year:           balance.Year,
		TotalAllocated: balance.TotalAllocated,
		UsedDays:       balance.UsedDays,
		RemainingDays:  balance.RemainingDays,
		CarryOverDays:  balance.CarryOverDays,
		CreatedAt:      balance.CreatedAt,
		UpdatedAt:      balance.UpdatedAt,
	}
}

// convertToUserInfo converts a model.User to UserInfo
func convertToUserInfo(user model.User) UserInfo {
	return UserInfo{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		IsActive:  user.IsActiveUser,
	}
}

// convertToUserLeaveBalanceResponse converts user and balances to UserLeaveBalanceResponse
func convertToUserLeaveBalanceResponse(user model.User, balances []model.LeaveBalance, year int) UserLeaveBalanceResponse {
	balanceResponses := make([]LeaveBalanceResponse, len(balances))
	for i, balance := range balances {
		balanceResponses[i] = convertToLeaveBalanceResponse(balance)
	}

	return UserLeaveBalanceResponse{
		User:     convertToUserInfo(user),
		Year:     year,
		Balances: balanceResponses,
	}
}

//---------- CONSTRUCTOR ----------

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
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(2024)) // Default to current year
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	// Get user info
	user, err := h.userModel.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
		return
	}

	// Get leave balances
	balances, err := h.leaveBalanceModel.GetUserLeaveBalance(uint(userID), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve leave balances",
		})
		return
	}

	// If no balances exist, initialize them
	if len(balances) == 0 {
		err = h.leaveBalanceModel.InitializeUserLeaveBalances(uint(userID), year)
		if err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to initialize leave balances",
			})
			return
		}
		// Get balances again after initialization
		balances, err = h.leaveBalanceModel.GetUserLeaveBalance(uint(userID), year)
		if err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to retrieve leave balances",
			})
			return
		}
	}

	response := convertToUserLeaveBalanceResponse(*user, balances, year)
	c.JSON(http.StatusOK, UserLeaveBalanceDetailResponse{
		Success: true,
		Message: "User leave balances retrieved successfully",
		Data:    response,
	})
}

// UpdateUserLeaveBalance updates a specific leave balance for a user
func (h *LeaveBalanceAdminHandler) UpdateUserLeaveBalance(c *gin.Context) {
	var req UpdateUserLeaveBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	// Check if user exists
	_, err = h.userModel.GetUserByID(req.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
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
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to create leave balance",
			})
			return
		}
	} else {
		// Update existing balance
		balance.TotalAllocated = req.TotalAllocated
		balance.CarryOverDays = req.CarryOverDays
		balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

		err = h.leaveBalanceModel.UpdateLeaveBalance(balance)
		if err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to update leave balance",
			})
			return
		}
	}

	response := convertToLeaveBalanceResponse(*balance)
	c.JSON(http.StatusOK, LeaveBalanceDetailResponse{
		Success: true,
		Message: "Leave balance updated successfully",
		Data:    response,
	})
}

// BulkUpdateUserLeaveBalances updates multiple leave balances for a user
func (h *LeaveBalanceAdminHandler) BulkUpdateUserLeaveBalances(c *gin.Context) {
	var req BulkUpdateLeaveBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	// Check if user exists
	_, err = h.userModel.GetUserByID(req.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
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
				c.JSON(http.StatusInternalServerError, ErrorResponse{
					Success: false,
					Message: "Failed to create leave balance",
				})
				return
			}
		} else {
			// Update existing balance
			balance.TotalAllocated = balanceReq.TotalAllocated
			balance.CarryOverDays = balanceReq.CarryOverDays
			balance.RemainingDays = balance.TotalAllocated + balance.CarryOverDays - balance.UsedDays

			err = h.leaveBalanceModel.UpdateLeaveBalance(balance)
			if err != nil {
				c.JSON(http.StatusInternalServerError, ErrorResponse{
					Success: false,
					Message: "Failed to update leave balance",
				})
				return
			}
		}

		updatedBalances = append(updatedBalances, *balance)
	}

	// Convert to response format
	balanceResponses := make([]LeaveBalanceResponse, len(updatedBalances))
	for i, balance := range updatedBalances {
		balanceResponses[i] = convertToLeaveBalanceResponse(balance)
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "Leave balances updated successfully",
		"balances": balanceResponses,
	})
}

// GetAllUsersLeaveBalances retrieves leave balances for all users
func (h *LeaveBalanceAdminHandler) GetAllUsersLeaveBalances(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	// Get all users
	users, err := h.userModel.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve users",
		})
		return
	}

	var result []UserLeaveBalanceResponse
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

		userResponse := convertToUserLeaveBalanceResponse(user, balances, year)
		result = append(result, userResponse)
	}

	c.JSON(http.StatusOK, LeaveBalanceListResponse{
		Success: true,
		Message: "All users leave balances retrieved successfully",
		Data:    result,
		Meta: struct {
			Year  int `json:"year"`
			Total int `json:"total"`
		}{
			Year:  year,
			Total: len(result),
		},
	})
}

// ResetUserLeaveBalances resets leave balances for a user for a new year
func (h *LeaveBalanceAdminHandler) ResetUserLeaveBalances(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	// Check if user exists
	user, err := h.userModel.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
		return
	}

	// Reset balances for the new year
	err = h.leaveBalanceModel.ResetLeaveBalancesForNewYear(uint(userID), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to reset leave balances",
		})
		return
	}

	// Get updated balances
	balances, err := h.leaveBalanceModel.GetUserLeaveBalance(uint(userID), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve updated balances",
		})
		return
	}

	response := convertToUserLeaveBalanceResponse(*user, balances, year)
	c.JSON(http.StatusOK, UserLeaveBalanceDetailResponse{
		Success: true,
		Message: "Leave balances reset successfully",
		Data:    response,
	})
}

// GetLeaveBalanceStats retrieves leave balance statistics
func (h *LeaveBalanceAdminHandler) GetLeaveBalanceStats(c *gin.Context) {
	yearStr := c.DefaultQuery("year", strconv.Itoa(2024))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	stats, err := h.leaveBalanceModel.GetLeaveUtilizationStats(year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve statistics",
		})
		return
	}

	c.JSON(http.StatusOK, LeaveBalanceStatsResponse{
		Success: true,
		Message: "Leave balance statistics retrieved successfully",
		Data: gin.H{
			"year":  year,
			"stats": stats,
		},
	})
}
