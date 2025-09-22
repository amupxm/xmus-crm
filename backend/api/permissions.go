// Package api provides HTTP API handlers for permission management.
// It includes proper validation, permission checks, and CRUD operations for permissions.
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

type PermissionAPI struct {
	db              *gorm.DB
	validate        *validator.Validate
	permissionModel *model.PermissionModel
}

//---------- REQUEST RESPONSE TYPES ----------

type CreatePermissionRequest struct {
	Key         string `json:"key" validate:"required,min=3,max=50"`
	Description string `json:"description" validate:"required,min=5,max=255"`
}

type UpdatePermissionRequest struct {
	Key         *string `json:"key,omitempty" validate:"omitempty,min=3,max=50"`
	Description *string `json:"description,omitempty" validate:"omitempty,min=5,max=255"`
}

type PermissionResponse struct {
	ID          uint   `json:"id"`
	Key         string `json:"key"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type PermissionListResponse struct {
	Success bool                 `json:"success"`
	Message string               `json:"message"`
	Data    []PermissionResponse `json:"data,omitempty"`
	Meta    struct {
		Total int `json:"total"`
		Page  int `json:"page"`
		Limit int `json:"limit"`
	} `json:"meta,omitempty"`
}

type PermissionDetailResponse struct {
	Success bool               `json:"success"`
	Message string             `json:"message"`
	Data    PermissionResponse `json:"data,omitempty"`
}

//---------- CONSTRUCTOR ----------

func NewPermissionAPI(db *gorm.DB) *PermissionAPI {
	return &PermissionAPI{
		db:              db,
		validate:        validator.New(),
		permissionModel: model.NewPermissionModel(db),
	}
}

//---------- ROUTES ----------

func (p *PermissionAPI) SetupRoutes(r *gin.RouterGroup) {
	permissionGroup := r.Group("/permissions")
	permissionGroup.Use(middleware.AuthMiddleware()) // Add auth middleware to all permission routes
	{
		permissionGroup.GET("", p.GetPermissions)
		permissionGroup.GET("/:id", p.GetPermission)
		permissionGroup.POST("", p.CreatePermission)
		permissionGroup.PUT("/:id", p.UpdatePermission)
		permissionGroup.DELETE("/:id", p.DeletePermission)
	}
}

//---------- HANDLERS ----------

// GetPermissions retrieves a list of permissions with pagination
func (p *PermissionAPI) GetPermissions(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(p.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "VIEW_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to view permissions",
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

	// Get permissions
	permissions := model.GetAllPermissions()

	// Convert to response format
	permissionResponses := make([]PermissionResponse, 0, len(permissions))
	for _, perm := range permissions {
		permissionResponses = append(permissionResponses, PermissionResponse{
			ID:          perm.Id,
			Key:         perm.Key,
			Description: perm.Description,
			CreatedAt:   perm.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:   perm.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	// Apply pagination
	start := (page - 1) * limit
	end := start + limit
	if start >= len(permissionResponses) {
		permissionResponses = []PermissionResponse{}
	} else if end > len(permissionResponses) {
		permissionResponses = permissionResponses[start:]
	} else {
		permissionResponses = permissionResponses[start:end]
	}

	c.JSON(http.StatusOK, PermissionListResponse{
		Success: true,
		Message: "Permissions retrieved successfully",
		Data:    permissionResponses,
		Meta: struct {
			Total int `json:"total"`
			Page  int `json:"page"`
			Limit int `json:"limit"`
		}{
			Total: len(permissions),
			Page:  page,
			Limit: limit,
		},
	})
}

// GetPermission retrieves a specific permission by ID
func (p *PermissionAPI) GetPermission(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(p.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "VIEW_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to view permissions",
		})
		return
	}

	// Parse permission ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid permission ID",
		})
		return
	}

	// Get permission
	permission, err := model.GetPermissionByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Permission not found",
		})
		return
	}

	response := PermissionResponse{
		ID:          permission.Id,
		Key:         permission.Key,
		Description: permission.Description,
		CreatedAt:   permission.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   permission.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, PermissionDetailResponse{
		Success: true,
		Message: "Permission retrieved successfully",
		Data:    response,
	})
}

// CreatePermission creates a new permission
func (p *PermissionAPI) CreatePermission(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(p.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to create permissions",
		})
		return
	}

	var req CreatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := p.validate.Struct(req); err != nil {
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

	// Check if permission key already exists
	_, err = model.GetPermissionByKey(req.Key)
	if err == nil {
		c.JSON(http.StatusConflict, ErrorResponse{
			Success: false,
			Message: "Permission with this key already exists",
		})
		return
	}

	// Create permission
	permission := &model.Permission{
		Key:         req.Key,
		Description: req.Description,
	}

	if err := p.permissionModel.CreatePermission(permission); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to create permission",
		})
		return
	}

	response := PermissionResponse{
		ID:          permission.Id,
		Key:         permission.Key,
		Description: permission.Description,
		CreatedAt:   permission.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   permission.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusCreated, PermissionDetailResponse{
		Success: true,
		Message: "Permission created successfully",
		Data:    response,
	})
}

// UpdatePermission updates a permission
func (p *PermissionAPI) UpdatePermission(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(p.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to update permissions",
		})
		return
	}

	// Parse permission ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid permission ID",
		})
		return
	}

	var req UpdatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request data",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := p.validate.Struct(req); err != nil {
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

	// Get existing permission
	permission, err := p.permissionModel.GetPermission(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Permission not found",
		})
		return
	}

	// Update fields if provided
	if req.Key != nil {
		// Check if new key already exists
		_, err = model.GetPermissionByKey(*req.Key)
		if err == nil && *req.Key != permission.Key {
			c.JSON(http.StatusConflict, ErrorResponse{
				Success: false,
				Message: "Permission with this key already exists",
			})
			return
		}
		permission.Key = *req.Key
	}
	if req.Description != nil {
		permission.Description = *req.Description
	}

	// Update permission
	if err := p.permissionModel.UpdatePermission(permission); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update permission",
		})
		return
	}

	response := PermissionResponse{
		ID:          permission.Id,
		Key:         permission.Key,
		Description: permission.Description,
		CreatedAt:   permission.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   permission.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, PermissionDetailResponse{
		Success: true,
		Message: "Permission updated successfully",
		Data:    response,
	})
}

// DeletePermission deletes a permission
func (p *PermissionAPI) DeletePermission(c *gin.Context) {
	// Check permission
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "User not authenticated",
		})
		return
	}

	userModel := model.NewUserModel(p.db)
	hasPermission, err := userModel.HasUserPermission(userID.(uint), "MANAGE_ROLES")
	if err != nil || !hasPermission {
		c.JSON(http.StatusForbidden, ErrorResponse{
			Success: false,
			Message: "Insufficient permissions to delete permissions",
		})
		return
	}

	// Parse permission ID from URL
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid permission ID",
		})
		return
	}

	// Check if permission exists
	_, err = p.permissionModel.GetPermission(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Permission not found",
		})
		return
	}

	// Delete permission
	if err := p.permissionModel.DeletePermission(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to delete permission",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Permission deleted successfully",
	})
}
