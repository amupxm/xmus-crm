// Package api provides HTTP API handlers for role management.
// It includes proper validation, permission checks, and CRUD operations for roles.
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

type RoleAPI struct {
	db        *gorm.DB
	validate  *validator.Validate
	roleModel *model.RoleModel
}

//---------- REQUEST RESPONSE TYPES ----------

type CreateRoleRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=50"`
	Description string `json:"description" validate:"required,min=5,max=255"`
	IsActive    bool   `json:"is_active"`
	Permissions []uint `json:"permissions" validate:"required,min=1"`
}

type UpdateRoleRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=3,max=50"`
	Description *string `json:"description,omitempty" validate:"omitempty,min=5,max=255"`
	IsActive    *bool   `json:"is_active,omitempty"`
	Permissions *[]uint `json:"permissions,omitempty" validate:"omitempty,min=1"`
}

type RoleResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsActive    bool   `json:"is_active"`
	Permissions []uint `json:"permissions"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type RoleListResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Data    []RoleResponse `json:"data,omitempty"`
	Meta    struct {
		Total int `json:"total"`
		Page  int `json:"page"`
		Limit int `json:"limit"`
	} `json:"meta,omitempty"`
}

type RoleDetailResponse struct {
	Success bool         `json:"success"`
	Message string       `json:"message"`
	Data    RoleResponse `json:"data,omitempty"`
}

//---------- CONSTRUCTOR ----------

func NewRoleAPI(db *gorm.DB) *RoleAPI {
	return &RoleAPI{
		db:        db,
		validate:  validator.New(),
		roleModel: model.NewRoleModel(db),
	}
}

//---------- ROUTES ----------

func (r *RoleAPI) SetupRoutes(router *gin.RouterGroup) {
	roleGroup := router.Group("/roles")
	roleGroup.Use(middleware.AuthMiddleware()) // Add auth middleware to all role routes
	{
		roleGroup.GET("", r.GetRoles)
		roleGroup.GET("/:id", r.GetRole)
		roleGroup.POST("", r.CreateRole)
		roleGroup.PUT("/:id", r.UpdateRole)
		roleGroup.DELETE("/:id", r.DeleteRole)
	}
}

//---------- HANDLERS ----------

// GetRoles retrieves a list of roles with pagination
func (r *RoleAPI) GetRoles(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(r.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "VIEW_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to view roles",
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

	// Get roles from database
	roles, err := r.roleModel.GetAllRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to retrieve roles",
		})
		return
	}

	// Convert to response format
	roleResponses := make([]RoleResponse, 0, len(roles))
	for _, role := range roles {
		roleResponses = append(roleResponses, RoleResponse{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
			IsActive:    role.IsActive,
			Permissions: role.Permissions,
			CreatedAt:   role.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:   role.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	// Apply pagination
	start := (page - 1) * limit
	end := start + limit
	if start >= len(roleResponses) {
		roleResponses = []RoleResponse{}
	} else if end > len(roleResponses) {
		roleResponses = roleResponses[start:]
	} else {
		roleResponses = roleResponses[start:end]
	}

	c.JSON(http.StatusOK, RoleListResponse{
		Success: true,
		Message: "Roles retrieved successfully",
		Data:    roleResponses,
		Meta: struct {
			Total int `json:"total"`
			Page  int `json:"page"`
			Limit int `json:"limit"`
		}{
			Total: len(roles),
			Page:  page,
			Limit: limit,
		},
	})
}

// GetRole retrieves a specific role by ID
func (r *RoleAPI) GetRole(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(r.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "VIEW_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to view roles",
		})
		return
	}

	// Parse role ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid role ID",
		})
		return
	}

	// Get role
	role, err := r.roleModel.GetRole(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Role not found",
		})
		return
	}

	response := RoleResponse{
		ID:          role.ID,
		Name:        role.Name,
		Description: role.Description,
		IsActive:    role.IsActive,
		Permissions: role.Permissions,
		CreatedAt:   role.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   role.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, RoleDetailResponse{
		Success: true,
		Message: "Role retrieved successfully",
		Data:    response,
	})
}

// CreateRole creates a new role
func (r *RoleAPI) CreateRole(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(r.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to create roles",
		})
		return
	}

	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := r.validate.Struct(req); err != nil {
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

	// Check if role name already exists
	var existingRole model.Role
	if err := r.db.Where("name = ?", req.Name).First(&existingRole).Error; err == nil {
		c.JSON(http.StatusConflict, ErrorResponse{
			Success: false,
			Message: "Role with this name already exists",
		})
		return
	}

	// Validate that all permission IDs exist
	for _, permID := range req.Permissions {
		var permission model.Permission
		if err := r.db.First(&permission, permID).Error; err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{
				Success: false,
				Message: "Invalid permission ID",
				Errors:  []string{err.Error()},
			})
			return
		}
	}

	// Create role
	role := &model.Role{
		Name:        req.Name,
		Description: req.Description,
		IsActive:    req.IsActive,
		Permissions: model.UintArray(req.Permissions),
	}

	if err := r.roleModel.CreateRole(role); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to create role",
		})
		return
	}

	response := RoleResponse{
		ID:          role.ID,
		Name:        role.Name,
		Description: role.Description,
		IsActive:    role.IsActive,
		Permissions: role.Permissions,
		CreatedAt:   role.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   role.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusCreated, RoleDetailResponse{
		Success: true,
		Message: "Role created successfully",
		Data:    response,
	})
}

// UpdateRole updates a role
func (r *RoleAPI) UpdateRole(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(r.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to update roles",
		})
		return
	}

	// Parse role ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid role ID",
		})
		return
	}

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := r.validate.Struct(req); err != nil {
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

	// Get existing role
	role, err := r.roleModel.GetRole(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Role not found",
		})
		return
	}

	// Update fields if provided
	if req.Name != nil {
		// Check if new name already exists
		var existingRole model.Role
		if err := r.db.Where("name = ? AND id != ?", *req.Name, role.ID).First(&existingRole).Error; err == nil {
			c.JSON(http.StatusConflict, ErrorResponse{
				Success: false,
				Message: "Role with this name already exists",
			})
			return
		}
		role.Name = *req.Name
	}
	if req.Description != nil {
		role.Description = *req.Description
	}
	if req.IsActive != nil {
		role.IsActive = *req.IsActive
	}
	if req.Permissions != nil {
		// Validate that all permission IDs exist
		for _, permID := range *req.Permissions {
			var permission model.Permission
			if err := r.db.First(&permission, permID).Error; err != nil {
				c.JSON(http.StatusBadRequest, ErrorResponse{
					Success: false,
					Message: "Invalid permission ID",
					Errors:  []string{err.Error()},
				})
				return
			}
		}
		role.Permissions = model.UintArray(*req.Permissions)
	}

	// Update role
	if err := r.roleModel.UpdateRole(role); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update role",
		})
		return
	}

	response := RoleResponse{
		ID:          role.ID,
		Name:        role.Name,
		Description: role.Description,
		IsActive:    role.IsActive,
		Permissions: role.Permissions,
		CreatedAt:   role.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   role.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, RoleDetailResponse{
		Success: true,
		Message: "Role updated successfully",
		Data:    response,
	})
}

// DeleteRole deletes a role
func (r *RoleAPI) DeleteRole(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(r.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to delete roles",
		})
		return
	}

	// Parse role ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid role ID",
		})
		return
	}

	// Check if role exists
	_, err = r.roleModel.GetRole(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Role not found",
		})
		return
	}

	// Check if role is being used by any users
	var userCount int64
	if err := r.db.Model(&model.User{}).Where("primary_role_id = ?", id).Count(&userCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to check role usage",
		})
		return
	}

	if userCount > 0 {
		c.JSON(http.StatusConflict, ErrorResponse{
			Success: false,
			Message: "Cannot delete role that is assigned to users",
		})
		return
	}

	// Delete role
	if err := r.roleModel.DeleteRole(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to delete role",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Role deleted successfully",
	})
}
