// Package api provides HTTP API handlers for team management.
// It includes proper validation, permission checks, and CRUD operations for teams.
package api

import (
	"net/http"
	"strconv"

	"github.com/amupxm/xmus-crm/backend/middleware"
	"github.com/amupxm/xmus-crm/backend/model"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type TeamAPI struct {
	db        *gorm.DB
	validate  *validator.Validate
	teamModel *model.TeamModel
}

//---------- REQUEST RESPONSE TYPES ----------

type CreateTeamRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=50"`
	Description string `json:"description" validate:"required,min=5,max=255"`
	TeamLeadID  uint   `json:"team_lead_id" validate:"required"`
	IsActive    bool   `json:"is_active"`
}

type UpdateTeamRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=3,max=50"`
	Description *string `json:"description,omitempty" validate:"omitempty,min=5,max=255"`
	TeamLeadID  *uint   `json:"team_lead_id,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
}

type TeamResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	TeamLeadID  uint   `json:"team_lead_id"`
	IsActive    bool   `json:"is_active"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type TeamListResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Data    []TeamResponse `json:"data,omitempty"`
	Meta    struct {
		Total int `json:"total"`
		Page  int `json:"page"`
		Limit int `json:"limit"`
	} `json:"meta,omitempty"`
}

type TeamDetailResponse struct {
	Success bool         `json:"success"`
	Message string       `json:"message"`
	Data    TeamResponse `json:"data,omitempty"`
}

//---------- CONSTRUCTOR ----------

func NewTeamAPI(db *gorm.DB) *TeamAPI {
	return &TeamAPI{
		db:        db,
		validate:  validator.New(),
		teamModel: model.NewTeamModel(db),
	}
}

//---------- ROUTES ----------

func (t *TeamAPI) SetupRoutes(router *gin.RouterGroup) {
	teamGroup := router.Group("/teams")
	teamGroup.Use(middleware.AuthMiddleware()) // Add auth middleware to all team routes
	{
		teamGroup.GET("", t.GetTeams)
		teamGroup.GET("/:id", t.GetTeam)
		teamGroup.POST("", t.CreateTeam)
		teamGroup.PUT("/:id", t.UpdateTeam)
		teamGroup.DELETE("/:id", t.DeleteTeam)
		teamGroup.POST("/:id/members", t.AddTeamMember)
		teamGroup.DELETE("/:id/members/:user_id", t.RemoveTeamMember)
		teamGroup.GET("/:id/members", t.GetTeamMembers)
	}
}

//---------- HANDLERS ----------

// GetTeams retrieves a list of teams with pagination
func (t *TeamAPI) GetTeams(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(t.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "VIEW_TEAMS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to view teams",
		})
		return
	}

	// Parse pagination parameters
	page := 1
	limit := 10
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	// Get teams from database
	teams, err := t.teamModel.GetAllTeams()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve teams",
		})
		return
	}

	// Convert to response format
	teamResponses := make([]TeamResponse, 0, len(teams))
	for _, team := range teams {
		teamResponses = append(teamResponses, TeamResponse{
			ID:          team.ID,
			Name:        team.Name,
			Description: team.Description,
			TeamLeadID:  team.TeamLeadID,
			IsActive:    team.IsActive,
			CreatedAt:   team.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:   team.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	// Apply pagination
	start := (page - 1) * limit
	end := start + limit
	if start >= len(teamResponses) {
		teamResponses = []TeamResponse{}
	} else if end > len(teamResponses) {
		teamResponses = teamResponses[start:]
	} else {
		teamResponses = teamResponses[start:end]
	}

	c.JSON(http.StatusOK, TeamListResponse{
		Success: true,
		Message: "Teams retrieved successfully",
		Data:    teamResponses,
		Meta: struct {
			Total int `json:"total"`
			Page  int `json:"page"`
			Limit int `json:"limit"`
		}{
			Total: len(teams),
			Page:  page,
			Limit: limit,
		},
	})
}

// GetTeam retrieves a specific team by ID
func (t *TeamAPI) GetTeam(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(t.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "VIEW_TEAMS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to view teams",
		})
		return
	}

	// Parse team ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid team ID",
		})
		return
	}

	// Get team
	team, err := t.teamModel.GetTeam(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Team not found",
		})
		return
	}

	response := TeamResponse{
		ID:          team.ID,
		Name:        team.Name,
		Description: team.Description,
		TeamLeadID:  team.TeamLeadID,
		IsActive:    team.IsActive,
		CreatedAt:   team.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   team.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, TeamDetailResponse{
		Success: true,
		Message: "Team retrieved successfully",
		Data:    response,
	})
}

// CreateTeam creates a new team
func (t *TeamAPI) CreateTeam(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(t.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_TEAMS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to create teams",
		})
		return
	}

	var req CreateTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := t.validate.Struct(req); err != nil {
		var errors []string
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, err.Error())
		}
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  errors,
		})
		return
	}

	// Check if team name already exists
	var existingTeam model.Team
	if err := t.db.Where("name = ?", req.Name).First(&existingTeam).Error; err == nil {
		c.JSON(http.StatusConflict, ErrorResponse{
			Success: false,
			Message: "Team with this name already exists",
		})
		return
	}

	// Validate that team lead exists
	var teamLead model.User
	if err := t.db.First(&teamLead, req.TeamLeadID).Error; err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Team lead not found",
		})
		return
	}

	// Create team
	team := &model.Team{
		Name:        req.Name,
		Description: req.Description,
		TeamLeadID:  req.TeamLeadID,
		IsActive:    req.IsActive,
	}

	if err := t.teamModel.CreateTeam(team); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to create team",
		})
		return
	}

	response := TeamResponse{
		ID:          team.ID,
		Name:        team.Name,
		Description: team.Description,
		TeamLeadID:  team.TeamLeadID,
		IsActive:    team.IsActive,
		CreatedAt:   team.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   team.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusCreated, TeamDetailResponse{
		Success: true,
		Message: "Team created successfully",
		Data:    response,
	})
}

// UpdateTeam updates a team
func (t *TeamAPI) UpdateTeam(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(t.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_TEAMS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to update teams",
		})
		return
	}

	// Parse team ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid team ID",
		})
		return
	}

	var req UpdateTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := t.validate.Struct(req); err != nil {
		var errors []string
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, err.Error())
		}
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  errors,
		})
		return
	}

	// Get existing team
	team, err := t.teamModel.GetTeam(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Team not found",
		})
		return
	}

	// Update fields if provided
	if req.Name != nil {
		// Check if new name already exists
		var existingTeam model.Team
		if err := t.db.Where("name = ? AND id != ?", *req.Name, team.ID).First(&existingTeam).Error; err == nil {
			c.JSON(http.StatusConflict, ErrorResponse{
				Success: false,
				Message: "Team with this name already exists",
			})
			return
		}
		team.Name = *req.Name
	}
	if req.Description != nil {
		team.Description = *req.Description
	}
	if req.TeamLeadID != nil {
		// Validate that team lead exists
		var teamLead model.User
		if err := t.db.First(&teamLead, *req.TeamLeadID).Error; err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Success: false,
				Message: "Team lead not found",
			})
			return
		}
		team.TeamLeadID = *req.TeamLeadID
	}
	if req.IsActive != nil {
		team.IsActive = *req.IsActive
	}

	// Update team
	if err := t.teamModel.UpdateTeam(team); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update team",
		})
		return
	}

	response := TeamResponse{
		ID:          team.ID,
		Name:        team.Name,
		Description: team.Description,
		TeamLeadID:  team.TeamLeadID,
		IsActive:    team.IsActive,
		CreatedAt:   team.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   team.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, TeamDetailResponse{
		Success: true,
		Message: "Team updated successfully",
		Data:    response,
	})
}

// DeleteTeam deletes a team
func (t *TeamAPI) DeleteTeam(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(t.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_TEAMS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to delete teams",
		})
		return
	}

	// Parse team ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid team ID",
		})
		return
	}

	// Check if team exists
	_, err = t.teamModel.GetTeam(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Team not found",
		})
		return
	}

	// Check if team has members
	var memberCount int64
	if err := t.db.Model(&model.TeamMember{}).Where("team_id = ?", id).Count(&memberCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to check team members",
		})
		return
	}

	if memberCount > 0 {
		c.JSON(http.StatusConflict, ErrorResponse{
			Success: false,
			Message: "Cannot delete team that has members. Please remove all members first.",
		})
		return
	}

	// Delete team
	if err := t.teamModel.DeleteTeam(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to delete team",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Team deleted successfully",
	})
}

// AddTeamMember adds a user to a team
func (t *TeamAPI) AddTeamMember(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(t.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_TEAMS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to manage team members",
		})
		return
	}

	// Parse team ID from URL
	teamIDStr := c.Param("id")
	teamID, err := strconv.ParseUint(teamIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid team ID",
		})
		return
	}

	var req struct {
		UserID uint `json:"user_id" validate:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate that team exists
	_, err = t.teamModel.GetTeam(uint(teamID))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Team not found",
		})
		return
	}

	// Validate that user exists
	var user model.User
	if err := t.db.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
		return
	}

	// Add team member
	if err := t.teamModel.AddTeamMember(uint(teamID), req.UserID); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to add team member",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Team member added successfully",
	})
}

// RemoveTeamMember removes a user from a team
func (t *TeamAPI) RemoveTeamMember(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(t.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_TEAMS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to manage team members",
		})
		return
	}

	// Parse team ID and user ID from URL
	teamIDStr := c.Param("id")
	userIDStr := c.Param("user_id")

	teamID, err := strconv.ParseUint(teamIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid team ID",
		})
		return
	}

	userIDToRemove, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
		return
	}

	// Remove team member
	if err := t.teamModel.RemoveTeamMember(uint(teamID), uint(userIDToRemove)); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to remove team member",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Team member removed successfully",
	})
}

// GetTeamMembers retrieves all members of a team
func (t *TeamAPI) GetTeamMembers(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(t.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "VIEW_TEAMS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to view team members",
		})
		return
	}

	// Parse team ID from URL
	teamIDStr := c.Param("id")
	teamID, err := strconv.ParseUint(teamIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid team ID",
		})
		return
	}

	// Get team members
	members, err := t.teamModel.GetTeamMembers(uint(teamID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve team members",
		})
		return
	}

	// Convert to response format
	var memberResponses []gin.H
	for _, member := range members {
		memberResponses = append(memberResponses, gin.H{
			"id":         member.ID,
			"email":      member.Email,
			"first_name": member.FirstName,
			"last_name":  member.LastName,
			"is_active":  member.IsActiveUser,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Team members retrieved successfully",
		"data":    memberResponses,
	})
}
