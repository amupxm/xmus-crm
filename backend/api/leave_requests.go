package api

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/amupxm/xmus-crm/backend/model"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// LeaveRequestHandler handles leave request API endpoints
type LeaveRequestHandler struct {
	leaveRequestModel  *model.LeaveRequestModel
	leaveBalanceModel  *model.LeaveBalanceModel
	leaveCalendarModel *model.LeaveCalendarModel
	leavePolicyModel   *model.LeavePolicyModel
}

// NewLeaveRequestHandler creates a new leave request handler
func NewLeaveRequestHandler(db *gorm.DB) *LeaveRequestHandler {
	return &LeaveRequestHandler{
		leaveRequestModel:  model.NewLeaveRequestModel(db),
		leaveBalanceModel:  model.NewLeaveBalanceModel(db),
		leaveCalendarModel: model.NewLeaveCalendarModel(db),
		leavePolicyModel:   model.NewLeavePolicyModel(db),
	}
}

// CreateLeaveRequestRequest represents the request body for creating a leave request
type CreateLeaveRequestRequest struct {
	LeaveType string `json:"leave_type" binding:"required"`
	StartDate string `json:"start_date" binding:"required"`
	EndDate   string `json:"end_date" binding:"required"`
	Reason    string `json:"reason"`
}

// UpdateLeaveRequestRequest represents the request body for updating a leave request
type UpdateLeaveRequestRequest struct {
	LeaveType string `json:"leave_type"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	Reason    string `json:"reason"`
}

// ApprovalRequest represents the request body for approval actions
type ApprovalRequest struct {
	Comments string `json:"comments"`
}

// ErrorResponse represents a standard error response

// CreateLeaveRequest creates a new leave request
func (h *LeaveRequestHandler) CreateLeaveRequest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	var req CreateLeaveRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Parse date strings (ISO 8601 format with timezone)
	startDate, err := time.Parse("2006-01-02T15:04:05-07:00", req.StartDate)
	if err != nil {
		// Try parsing without timezone as fallback
		startDate, err = time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Success: false,
				Message: "Invalid start_date format. Expected YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS+07:00",
				Errors:  []string{"start_date format is invalid"},
			})
			return
		}
	}

	endDate, err := time.Parse("2006-01-02T15:04:05-07:00", req.EndDate)
	if err != nil {
		// Try parsing without timezone as fallback
		endDate, err = time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Success: false,
				Message: "Invalid end_date format. Expected YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS+07:00",
				Errors:  []string{"end_date format is invalid"},
			})
			return
		}
	}

	// Convert string to LeaveType
	leaveType := model.LeaveType(req.LeaveType)

	// Create leave request
	leaveRequest := &model.LeaveRequest{
		UserID:    userID.(uint),
		LeaveType: leaveType,
		StartDate: startDate,
		EndDate:   endDate,
		Reason:    req.Reason,
		Status:    model.StatusPending,
	}

	// Validate the request
	if err := h.leaveRequestModel.ValidateLeaveRequest(leaveRequest); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate against leave policy
	if err := h.leavePolicyModel.ValidateLeaveRequestAgainstPolicy(leaveRequest); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Leave policy validation failed",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Check leave balance
	balance, err := h.leaveBalanceModel.GetUserLeaveBalanceByType(userID.(uint), time.Now().Year(), leaveType)
	if err != nil {
		// Initialize balance if it doesn't exist
		if err := h.leaveBalanceModel.InitializeUserLeaveBalances(userID.(uint), time.Now().Year()); err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to initialize leave balance",
			})
			return
		}
		balance, err = h.leaveBalanceModel.GetUserLeaveBalanceByType(userID.(uint), time.Now().Year(), leaveType)
		if err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to get leave balance",
			})
			return
		}
	}

	if balance.RemainingDays < leaveRequest.DaysRequested {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Insufficient leave balance",
			Errors:  []string{fmt.Sprintf("You have %d days remaining, but requested %d days", balance.RemainingDays, leaveRequest.DaysRequested)},
		})
		return
	}

	// Create the leave request
	if err := h.leaveRequestModel.CreateLeaveRequest(leaveRequest); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to create leave request",
		})
		return
	}

	// Create calendar entries
	if err := h.leaveCalendarModel.CreateCalendarEntriesForLeaveRequest(leaveRequest); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to create calendar entries",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Leave request created successfully",
		"data":    leaveRequest,
	})
}

// GetLeaveRequests retrieves leave requests for the authenticated user
func (h *LeaveRequestHandler) GetLeaveRequests(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	// Get year parameter (default to current year)
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	leaveRequests, err := h.leaveRequestModel.GetLeaveRequestsByYear(userID.(uint), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve leave requests",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave requests retrieved successfully",
		"data":    leaveRequests,
	})
}

// GetLeaveRequest retrieves a specific leave request
func (h *LeaveRequestHandler) GetLeaveRequest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid ID parameter",
		})
		return
	}

	leaveRequest, err := h.leaveRequestModel.GetLeaveRequest(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Leave request not found",
		})
		return
	}

	// Check if user has permission to view this request
	if leaveRequest.UserID != userID.(uint) {
		// Check if user is team lead, HR, or management
		hasPermission := false
		// Add permission checks here based on user roles
		if !hasPermission {
			c.JSON(http.StatusForbidden, ErrorResponse{
				Success: false,
				Message: "Access denied",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave request retrieved successfully",
		"data":    leaveRequest,
	})
}

// UpdateLeaveRequest updates a leave request
func (h *LeaveRequestHandler) UpdateLeaveRequest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid ID parameter",
		})
		return
	}

	var req UpdateLeaveRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Get existing leave request
	leaveRequest, err := h.leaveRequestModel.GetLeaveRequest(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Leave request not found",
		})
		return
	}

	// Check if user can update this request
	if leaveRequest.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Access denied",
		})
		return
	}

	// Check if request can be updated (only pending requests)
	if leaveRequest.Status != model.StatusPending {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Only pending requests can be updated",
		})
		return
	}

	// Update fields
	if req.LeaveType != "" {
		leaveRequest.LeaveType = model.LeaveType(req.LeaveType)
	}
	if req.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Success: false,
				Message: "Invalid start_date format. Expected YYYY-MM-DD",
			})
			return
		}
		leaveRequest.StartDate = startDate
	}
	if req.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Success: false,
				Message: "Invalid end_date format. Expected YYYY-MM-DD",
			})
			return
		}
		leaveRequest.EndDate = endDate
	}
	if req.Reason != "" {
		leaveRequest.Reason = req.Reason
	}

	// Recalculate days requested
	leaveRequest.DaysRequested = int(leaveRequest.EndDate.Sub(leaveRequest.StartDate).Hours()/24) + 1

	// Validate the updated request
	if err := h.leaveRequestModel.ValidateLeaveRequest(leaveRequest); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Update the request
	if err := h.leaveRequestModel.UpdateLeaveRequest(leaveRequest); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update leave request",
		})
		return
	}

	// Update calendar entries
	if err := h.leaveCalendarModel.CreateCalendarEntriesForLeaveRequest(leaveRequest); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update calendar entries",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave request updated successfully",
		"data":    leaveRequest,
	})
}

// CancelLeaveRequest cancels a leave request
func (h *LeaveRequestHandler) CancelLeaveRequest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid ID parameter",
		})
		return
	}

	// Cancel the request
	if err := h.leaveRequestModel.CancelLeaveRequest(uint(id), userID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to cancel leave request",
		})
		return
	}

	// Update calendar entries status
	if err := h.leaveCalendarModel.UpdateCalendarEntryStatus(uint(id), model.StatusCancelled); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update calendar entries",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave request cancelled successfully",
	})
}

// GetLeaveBalance retrieves leave balance for the authenticated user
func (h *LeaveRequestHandler) GetLeaveBalance(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	// Get year parameter (default to current year)
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	// Initialize balances if they don't exist
	if err := h.leaveBalanceModel.InitializeUserLeaveBalances(userID.(uint), year); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to initialize leave balances",
		})
		return
	}

	balances, err := h.leaveBalanceModel.GetUserLeaveBalance(userID.(uint), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve leave balance",
		})
		return
	}

	// Convert to response format
	balanceResponses := make([]LeaveBalanceResponse, len(balances))
	for i, balance := range balances {
		balanceResponses[i] = convertToLeaveBalanceResponse(balance)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave balance retrieved successfully",
		"data":    balanceResponses,
		"year":    year,
	})
}

// GetLeaveStats retrieves leave statistics for the authenticated user
func (h *LeaveRequestHandler) GetLeaveStats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	stats, err := h.leaveRequestModel.GetLeaveRequestStats(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve leave statistics",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave statistics retrieved successfully",
		"data":    stats,
	})
}

// GetLeaveCalendar retrieves leave calendar for a specific year
func (h *LeaveRequestHandler) GetLeaveCalendar(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	yearStr := c.Param("year")
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	entries, err := h.leaveCalendarModel.GetCalendarEntriesForYear(userID.(uint), year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve leave calendar",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave calendar retrieved successfully",
		"data":    entries,
	})
}

// GetPendingApprovals retrieves pending approvals for the authenticated user
func (h *LeaveRequestHandler) GetPendingApprovals(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	approvalType := c.Query("type") // team-lead, hr, management

	var requests []model.LeaveRequest
	var err error

	switch approvalType {
	case "team-lead":
		requests, err = h.leaveRequestModel.GetPendingTeamLeadApprovals(userID.(uint))
	case "hr":
		requests, err = h.leaveRequestModel.GetPendingHRApprovals()
	case "management":
		requests, err = h.leaveRequestModel.GetPendingManagementApprovals()
	default:
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid approval type",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve pending approvals",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pending approvals retrieved successfully",
		"data":    requests,
	})
}

// ApproveLeaveRequest approves a leave request
func (h *LeaveRequestHandler) ApproveLeaveRequest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid ID parameter",
		})
		return
	}

	var req ApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Process the approval
	if err := h.leaveRequestModel.ProcessLeaveRequestWorkflow(uint(id), userID.(uint), "approve", req.Comments); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Get updated request to check if it's fully approved
	leaveRequest, err := h.leaveRequestModel.GetLeaveRequest(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve updated request",
		})
		return
	}

	// If fully approved, update leave balance and calendar
	if leaveRequest.Status == model.StatusApproved || leaveRequest.Status == model.StatusManagementApproved {
		// Update leave balance
		if err := h.leaveBalanceModel.IncrementUsedDays(leaveRequest.UserID, leaveRequest.StartDate.Year(), leaveRequest.LeaveType, leaveRequest.DaysRequested); err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to update leave balance",
			})
			return
		}

		// Update calendar entries status
		if err := h.leaveCalendarModel.UpdateCalendarEntryStatus(uint(id), leaveRequest.Status); err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to update calendar entries",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave request approved successfully",
		"data":    leaveRequest,
	})
}

// RejectLeaveRequest rejects a leave request
func (h *LeaveRequestHandler) RejectLeaveRequest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid ID parameter",
		})
		return
	}

	var req ApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Process the rejection
	if err := h.leaveRequestModel.ProcessLeaveRequestWorkflow(uint(id), userID.(uint), "reject", req.Comments); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Update calendar entries status
	if err := h.leaveCalendarModel.UpdateCalendarEntryStatus(uint(id), model.StatusRejected); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update calendar entries",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Leave request rejected successfully",
	})
}

// GetLeaveRequestWorkflowStatus retrieves the workflow status of a leave request
func (h *LeaveRequestHandler) GetLeaveRequestWorkflowStatus(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid ID parameter",
		})
		return
	}

	status, err := h.leaveRequestModel.GetLeaveRequestWorkflowStatus(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve workflow status",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Workflow status retrieved successfully",
		"data":    status,
	})
}

// GetLeaveRequestTimeline retrieves the approval timeline of a leave request
func (h *LeaveRequestHandler) GetLeaveRequestTimeline(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid ID parameter",
		})
		return
	}

	timeline, err := h.leaveRequestModel.GetLeaveRequestTimeline(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve timeline",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Timeline retrieved successfully",
		"data":    timeline,
	})
}

// GetLeaveRequestSummary retrieves leave request summary for reporting
func (h *LeaveRequestHandler) GetLeaveRequestSummary(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid year parameter",
		})
		return
	}

	summary, err := h.leaveRequestModel.GetLeaveRequestSummary(year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve summary",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Summary retrieved successfully",
		"data":    summary,
	})
}
