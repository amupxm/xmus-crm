// Package api provides HTTP API handlers for user management.
// It includes proper validation, permission checks, and CRUD operations for users.
package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/amupxm/xmus-crm/backend/middleware"
	"github.com/amupxm/xmus-crm/backend/model"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type UserAPI struct {
	db        *gorm.DB
	validate  *validator.Validate
	userModel *model.UserModel
}

//---------- REQUEST RESPONSE TYPES ----------

type CreateUserRequest struct {
	Email          string  `json:"email" validate:"required,email"`
	Password       string  `json:"password" validate:"required,min=6"`
	FirstName      string  `json:"first_name" validate:"required,min=2"`
	LastName       string  `json:"last_name" validate:"required,min=2"`
	Salary         float64 `json:"salary" validate:"required,min=0"`
	SalaryCurrency string  `json:"salary_currency" validate:"required,len=3"`
	PrimaryRoleID  uint    `json:"primary_role_id" validate:"required"`
	PrimaryTeamID  uint    `json:"primary_team_id" validate:"required"`
	RoleIDs        []uint  `json:"role_ids,omitempty"`
	TeamIDs        []uint  `json:"team_ids,omitempty"`
}

type UpdateUserRequest struct {
	Email          *string  `json:"email,omitempty" validate:"omitempty,email"`
	FirstName      *string  `json:"first_name,omitempty" validate:"omitempty,min=2"`
	LastName       *string  `json:"last_name,omitempty" validate:"omitempty,min=2"`
	Salary         *float64 `json:"salary,omitempty" validate:"omitempty,min=0"`
	SalaryCurrency *string  `json:"salary_currency,omitempty" validate:"omitempty,len=3"`
	IsActiveUser   *bool    `json:"is_active,omitempty"`
	PrimaryRoleID  *uint    `json:"primary_role_id,omitempty"`
	PrimaryTeamID  *uint    `json:"primary_team_id,omitempty"`
	RoleIDs        []uint   `json:"role_ids,omitempty"`
	TeamIDs        []uint   `json:"team_ids,omitempty"`
}

type UserDetailResponse struct {
	ID             uint       `json:"id"`
	Email          string     `json:"email"`
	FirstName      string     `json:"first_name"`
	LastName       string     `json:"last_name"`
	IsActive       bool       `json:"is_active"`
	Salary         float64    `json:"salary"`
	SalaryCurrency string     `json:"salary_currency"`
	PrimaryRoleID  uint       `json:"primary_role_id"`
	PrimaryTeamID  uint       `json:"primary_team_id"`
	Roles          []RoleInfo `json:"roles,omitempty"`
	Teams          []TeamInfo `json:"teams,omitempty"`
	LastLogin      *time.Time `json:"last_login,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type RoleInfo struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type TeamInfo struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type UserListResponse struct {
	Success bool                 `json:"success"`
	Message string               `json:"message"`
	Data    []UserDetailResponse `json:"data,omitempty"`
	Meta    struct {
		Total int `json:"total"`
		Page  int `json:"page"`
		Limit int `json:"limit"`
	} `json:"meta,omitempty"`
}

type UserDetailResponseWrapper struct {
	Success bool               `json:"success"`
	Message string             `json:"message"`
	Data    UserDetailResponse `json:"data,omitempty"`
}

//---------- CONSTRUCTOR ----------

func NewUserAPI(db *gorm.DB) *UserAPI {
	return &UserAPI{
		db:        db,
		validate:  validator.New(),
		userModel: model.NewUserModel(db),
	}
}

//---------- ROUTES ----------

func (u *UserAPI) SetupRoutes(r *gin.RouterGroup) {
	userGroup := r.Group("/users")
	userGroup.Use(middleware.AuthMiddleware()) // Add auth middleware to all user routes
	{
		userGroup.GET("/get_me", u.GetMe)
		userGroup.POST("", u.CreateUser)
		userGroup.GET("", u.GetUsers)
		userGroup.GET("/:id", u.GetUser)
		userGroup.PUT("/:id", u.UpdateUser)
		userGroup.DELETE("/:id", u.DeleteUser)
	}
}

//---------- HANDLERS ----------

// GetMe returns the current user's information
func (u *UserAPI) GetMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	user, err := u.userModel.GetUserByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
		return
	}

	// Get user's roles and teams
	roles, err := u.userModel.GetUserRoles(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get user roles",
		})
		return
	}

	teams, err := u.userModel.GetUserTeams(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get user teams",
		})
		return
	}

	// Convert to response format
	roleInfos := make([]RoleInfo, len(roles))
	for i, role := range roles {
		roleInfos[i] = RoleInfo{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
		}
	}

	teamInfos := make([]TeamInfo, len(teams))
	for i, team := range teams {
		teamInfos[i] = TeamInfo{
			ID:          team.ID,
			Name:        team.Name,
			Description: team.Description,
		}
	}

	response := UserDetailResponse{
		ID:             user.ID,
		Email:          user.Email,
		FirstName:      user.FirstName,
		LastName:       user.LastName,
		IsActive:       user.IsActiveUser,
		Salary:         user.Salary,
		SalaryCurrency: user.SalaryCurrency,
		PrimaryRoleID:  user.PrimaryRoleID,
		PrimaryTeamID:  user.PrimaryTeamID,
		Roles:          roleInfos,
		Teams:          teamInfos,
		LastLogin:      user.LastLoginTime,
		CreatedAt:      user.CreatedAt,
		UpdatedAt:      user.UpdatedAt,
	}

	c.JSON(http.StatusOK, UserDetailResponseWrapper{
		Success: true,
		Message: "User information retrieved successfully",
		Data:    response,
	})
}

// CreateUser creates a new user
func (u *UserAPI) CreateUser(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	hasPermission, err := u.userModel.HasUserPermission(userID.(uint), "CREATE_USERS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to create users",
		})
		return
	}

	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := u.validate.Struct(req); err != nil {
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

	// Hash password
	hashedPassword, err := model.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to hash password",
		})
		return
	}

	// Create user
	user := &model.User{
		Email:          req.Email,
		Password:       hashedPassword,
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		IsActiveUser:   true,
		Salary:         req.Salary,
		SalaryCurrency: req.SalaryCurrency,
		PrimaryRoleID:  req.PrimaryRoleID,
		PrimaryTeamID:  req.PrimaryTeamID,
	}

	if err := u.userModel.CreateNewUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to create user",
		})
		return
	}

	// Assign roles if provided
	if len(req.RoleIDs) > 0 {
		for _, roleID := range req.RoleIDs {
			if err := u.userModel.AssignRoleToUser(user.ID, roleID); err != nil {
				// Log error but continue
				continue
			}
		}
	}

	// Assign teams if provided
	if len(req.TeamIDs) > 0 {
		for _, teamID := range req.TeamIDs {
			if err := u.userModel.AddUserToTeam(user.ID, teamID); err != nil {
				// Log error but continue
				continue
			}
		}
	}

	// Get updated user with roles and teams
	updatedUser, err := u.userModel.GetUserByID(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "User created but failed to retrieve details",
		})
		return
	}

	// Convert to response format
	response := UserDetailResponse{
		ID:             updatedUser.ID,
		Email:          updatedUser.Email,
		FirstName:      updatedUser.FirstName,
		LastName:       updatedUser.LastName,
		IsActive:       updatedUser.IsActiveUser,
		Salary:         updatedUser.Salary,
		SalaryCurrency: updatedUser.SalaryCurrency,
		PrimaryRoleID:  updatedUser.PrimaryRoleID,
		PrimaryTeamID:  updatedUser.PrimaryTeamID,
		CreatedAt:      updatedUser.CreatedAt,
		UpdatedAt:      updatedUser.UpdatedAt,
	}

	c.JSON(http.StatusCreated, UserDetailResponseWrapper{
		Success: true,
		Message: "User created successfully",
		Data:    response,
	})
}

// GetUsers retrieves a list of users with pagination
func (u *UserAPI) GetUsers(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	hasPermission, err := u.userModel.HasUserPermission(userID.(uint), "READ_USERS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to read users",
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

	// Get users
	users, err := u.userModel.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve users",
		})
		return
	}

	// Convert to response format
	userResponses := make([]UserDetailResponse, len(users))
	for i, user := range users {
		userResponses[i] = UserDetailResponse{
			ID:             user.ID,
			Email:          user.Email,
			FirstName:      user.FirstName,
			LastName:       user.LastName,
			IsActive:       user.IsActiveUser,
			Salary:         user.Salary,
			SalaryCurrency: user.SalaryCurrency,
			PrimaryRoleID:  user.PrimaryRoleID,
			PrimaryTeamID:  user.PrimaryTeamID,
			LastLogin:      user.LastLoginTime,
			CreatedAt:      user.CreatedAt,
			UpdatedAt:      user.UpdatedAt,
		}
	}

	// Apply pagination
	start := (page - 1) * limit
	end := start + limit
	if start >= len(userResponses) {
		userResponses = []UserDetailResponse{}
	} else if end > len(userResponses) {
		userResponses = userResponses[start:]
	} else {
		userResponses = userResponses[start:end]
	}

	c.JSON(http.StatusOK, UserListResponse{
		Success: true,
		Message: "Users retrieved successfully",
		Data:    userResponses,
		Meta: struct {
			Total int `json:"total"`
			Page  int `json:"page"`
			Limit int `json:"limit"`
		}{
			Total: len(users),
			Page:  page,
			Limit: limit,
		},
	})
}

// GetUser retrieves a specific user by ID
func (u *UserAPI) GetUser(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	hasPermission, err := u.userModel.HasUserPermission(userID.(uint), "READ_USERS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to read users",
		})
		return
	}

	// Parse user ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
		return
	}

	// Get user
	user, err := u.userModel.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
		return
	}

	// Get user's roles and teams
	roles, err := u.userModel.GetUserRoles(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get user roles",
		})
		return
	}

	teams, err := u.userModel.GetUserTeams(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get user teams",
		})
		return
	}

	// Convert to response format
	roleInfos := make([]RoleInfo, len(roles))
	for i, role := range roles {
		roleInfos[i] = RoleInfo{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
		}
	}

	teamInfos := make([]TeamInfo, len(teams))
	for i, team := range teams {
		teamInfos[i] = TeamInfo{
			ID:          team.ID,
			Name:        team.Name,
			Description: team.Description,
		}
	}

	response := UserDetailResponse{
		ID:             user.ID,
		Email:          user.Email,
		FirstName:      user.FirstName,
		LastName:       user.LastName,
		IsActive:       user.IsActiveUser,
		Salary:         user.Salary,
		SalaryCurrency: user.SalaryCurrency,
		PrimaryRoleID:  user.PrimaryRoleID,
		PrimaryTeamID:  user.PrimaryTeamID,
		Roles:          roleInfos,
		Teams:          teamInfos,
		LastLogin:      user.LastLoginTime,
		CreatedAt:      user.CreatedAt,
		UpdatedAt:      user.UpdatedAt,
	}

	c.JSON(http.StatusOK, UserDetailResponseWrapper{
		Success: true,
		Message: "User retrieved successfully",
		Data:    response,
	})
}

// UpdateUser updates a user
func (u *UserAPI) UpdateUser(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	hasPermission, err := u.userModel.HasUserPermission(userID.(uint), "UPDATE_USERS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to update users",
		})
		return
	}

	// Parse user ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := u.validate.Struct(req); err != nil {
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

	// Get existing user
	user, err := u.userModel.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
		return
	}

	// Update fields if provided
	if req.Email != nil {
		user.Email = *req.Email
	}
	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Salary != nil {
		user.Salary = *req.Salary
	}
	if req.SalaryCurrency != nil {
		user.SalaryCurrency = *req.SalaryCurrency
	}
	if req.IsActiveUser != nil {
		user.IsActiveUser = *req.IsActiveUser
	}
	if req.PrimaryRoleID != nil {
		user.PrimaryRoleID = *req.PrimaryRoleID
	}
	if req.PrimaryTeamID != nil {
		user.PrimaryTeamID = *req.PrimaryTeamID
	}

	// Update user
	if err := u.userModel.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update user",
		})
		return
	}

	// Update roles if provided
	if len(req.RoleIDs) > 0 {
		// Clear existing roles
		existingRoles, _ := u.userModel.GetUserRoles(user.ID)
		for _, role := range existingRoles {
			u.userModel.RemoveRoleFromUser(user.ID, role.ID)
		}

		// Assign new roles
		for _, roleID := range req.RoleIDs {
			u.userModel.AssignRoleToUser(user.ID, roleID)
		}
	}

	// Update teams if provided
	if len(req.TeamIDs) > 0 {
		// Clear existing teams
		existingTeams, _ := u.userModel.GetUserTeams(user.ID)
		for _, team := range existingTeams {
			u.userModel.RemoveUserFromTeam(user.ID, team.ID)
		}

		// Assign new teams
		for _, teamID := range req.TeamIDs {
			u.userModel.AddUserToTeam(user.ID, teamID)
		}
	}

	// Get updated user
	updatedUser, err := u.userModel.GetUserByID(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "User updated but failed to retrieve details",
		})
		return
	}

	// Convert to response format
	response := UserDetailResponse{
		ID:             updatedUser.ID,
		Email:          updatedUser.Email,
		FirstName:      updatedUser.FirstName,
		LastName:       updatedUser.LastName,
		IsActive:       updatedUser.IsActiveUser,
		Salary:         updatedUser.Salary,
		SalaryCurrency: updatedUser.SalaryCurrency,
		PrimaryRoleID:  updatedUser.PrimaryRoleID,
		PrimaryTeamID:  updatedUser.PrimaryTeamID,
		CreatedAt:      updatedUser.CreatedAt,
		UpdatedAt:      updatedUser.UpdatedAt,
	}

	c.JSON(http.StatusOK, UserDetailResponseWrapper{
		Success: true,
		Message: "User updated successfully",
		Data:    response,
	})
}

// DeleteUser deletes a user
func (u *UserAPI) DeleteUser(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	hasPermission, err := u.userModel.HasUserPermission(userID.(uint), "DELETE_USERS")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to delete users",
		})
		return
	}

	// Parse user ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid user ID",
		})
		return
	}

	// Check if user exists
	_, err = u.userModel.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "User not found",
		})
		return
	}

	// Prevent self-deletion
	if userID.(uint) == uint(id) {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Cannot delete your own account",
		})
		return
	}

	// Delete user
	if err := u.userModel.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to delete user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User deleted successfully",
	})
}
