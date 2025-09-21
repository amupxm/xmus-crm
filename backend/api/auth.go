// Package api provides HTTP API handlers for authentication and user management.
// It includes proper validation, JWT token generation, and secure password handling.
package api

import (
	"net/http"
	"time"

	"github.com/amupxm/xmus-crm/backend/model"
	"github.com/amupxm/xmus-crm/backend/service"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type AuthAPI struct {
	db        *gorm.DB
	validate  *validator.Validate
	userModel *model.UserModel
}

//---------- REQUEST RESPONSE TYPES ----------

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    struct {
		User         UserResponse `json:"user"`
		AccessToken  string       `json:"access_token"`
		RefreshToken string       `json:"refresh_token"`
		ExpiresIn    int64        `json:"expires_in"`
	} `json:"data,omitempty"`
}

type UserResponse struct {
	ID        uint       `json:"id"`
	Email     string     `json:"email"`
	FirstName string     `json:"first_name"`
	LastName  string     `json:"last_name"`
	IsActive  bool       `json:"is_active"`
	LastLogin *time.Time `json:"last_login,omitempty"`
}

type RefreshTokenResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int64  `json:"expires_in"`
	} `json:"data,omitempty"`
}

type LogoutResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	Success bool     `json:"success"`
	Message string   `json:"message"`
	Errors  []string `json:"errors,omitempty"`
}

// ---------- END OF REQUEST RESPONSE TYPES ----------
func NewAuthAPI(db *gorm.DB) *AuthAPI {
	return &AuthAPI{
		db:        db,
		validate:  validator.New(),
		userModel: model.NewUserModel(db),
	}
}

func (a *AuthAPI) RegisterRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", a.Login)
		auth.POST("/refresh", a.RefreshToken)
		auth.POST("/logout", a.Logout)
	}
}

func (a *AuthAPI) Login(c *gin.Context) {
	var req LoginRequest

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := a.validate.Struct(req); err != nil {
		var validationErrors []string
		for _, err := range err.(validator.ValidationErrors) {
			validationErrors = append(validationErrors, getValidationErrorMessage(err))
		}
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  validationErrors,
		})
		return
	}

	// Find user by email
	user, err := a.userModel.GetUserByEmail(req.Email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, ErrorResponse{
				Success: false,
				Message: "Invalid credentials - user not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Database error",
		})
		return
	}

	// Check if user is active
	if !user.IsActiveUser {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Account is deactivated",
		})
		return
	}

	// Verify password
	if err := model.VerifyPassword(user.Password, req.Password); err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Invalid credentials",
		})
		return
	}

	// Generate JWT tokens
	now := time.Now()
	tokenPair, err := service.GenerateJWTTokenPair(service.JWTPayload{UserID: user.ID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to generate tokens",
		})
		return
	}

	// Update last login time and refresh token
	user.LastLoginTime = &now
	user.RefreshToken = tokenPair.RefreshJWTToken
	refreshExpiry := now.Add(time.Hour * 24 * 7) // 7 days
	user.RefreshTokenExpiry = &refreshExpiry

	if err := a.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update user login info",
		})
		return
	}

	// Prepare response
	response := LoginResponse{
		Success: true,
		Message: "Login successful",
		Data: struct {
			User         UserResponse `json:"user"`
			AccessToken  string       `json:"access_token"`
			RefreshToken string       `json:"refresh_token"`
			ExpiresIn    int64        `json:"expires_in"`
		}{
			User: UserResponse{
				ID:        user.ID,
				Email:     user.Email,
				FirstName: user.FirstName,
				LastName:  user.LastName,
				IsActive:  user.IsActiveUser,
				LastLogin: user.LastLoginTime,
			},
			AccessToken:  tokenPair.JWTToken,
			RefreshToken: tokenPair.RefreshJWTToken,
			ExpiresIn:    int64((time.Minute * 15).Seconds()), // 15 minutes
		},
	}

	c.JSON(http.StatusOK, response)
}

func (a *AuthAPI) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := a.validate.Struct(req); err != nil {
		var validationErrors []string
		for _, err := range err.(validator.ValidationErrors) {
			validationErrors = append(validationErrors, getValidationErrorMessage(err))
		}
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  validationErrors,
		})
		return
	}

	// Parse and validate refresh token
	payload, err := service.ParseRefreshJWTToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Invalid refresh token",
		})
		return
	}

	// Find user by ID
	user, err := a.userModel.GetUserByID(payload.UserID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, ErrorResponse{
				Success: false,
				Message: "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Database error",
		})
		return
	}

	// Check if user is active
	if !user.IsActiveUser {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Account is deactivated",
		})
		return
	}

	// Verify refresh token matches stored token
	if user.RefreshToken != req.RefreshToken {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Invalid refresh token",
		})
		return
	}

	// Check if refresh token is expired
	if user.RefreshTokenExpiry != nil && user.RefreshTokenExpiry.Before(time.Now()) {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Refresh token expired",
		})
		return
	}

	// Generate new JWT tokens
	now := time.Now()
	tokenPair, err := service.GenerateJWTTokenPair(service.JWTPayload{UserID: user.ID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to generate tokens",
		})
		return
	}

	// Update refresh token in database
	user.RefreshToken = tokenPair.RefreshJWTToken
	refreshExpiry := now.Add(time.Hour * 24 * 7) // 7 days
	user.RefreshTokenExpiry = &refreshExpiry

	if err := a.db.Save(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update refresh token",
		})
		return
	}

	// Prepare response
	response := RefreshTokenResponse{
		Success: true,
		Message: "Token refreshed successfully",
		Data: struct {
			AccessToken  string `json:"access_token"`
			RefreshToken string `json:"refresh_token"`
			ExpiresIn    int64  `json:"expires_in"`
		}{
			AccessToken:  tokenPair.JWTToken,
			RefreshToken: tokenPair.RefreshJWTToken,
			ExpiresIn:    int64((time.Minute * 15).Seconds()), // 15 minutes
		},
	}

	c.JSON(http.StatusOK, response)
}

func (a *AuthAPI) Logout(c *gin.Context) {
	var req LogoutRequest

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Validate request
	if err := a.validate.Struct(req); err != nil {
		var validationErrors []string
		for _, err := range err.(validator.ValidationErrors) {
			validationErrors = append(validationErrors, getValidationErrorMessage(err))
		}
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  validationErrors,
		})
		return
	}

	// Parse refresh token to get user ID
	payload, err := service.ParseRefreshJWTToken(req.RefreshToken)
	if err != nil {
		// Even if token is invalid, we consider logout successful
		c.JSON(http.StatusOK, LogoutResponse{
			Success: true,
			Message: "Logged out successfully",
		})
		return
	}

	// Find user and clear refresh token
	user, err := a.userModel.GetUserByID(payload.UserID)
	if err == nil {
		// Clear refresh token from database
		user.RefreshToken = ""
		user.RefreshTokenExpiry = nil
		a.db.Save(user)
	}

	c.JSON(http.StatusOK, LogoutResponse{
		Success: true,
		Message: "Logged out successfully",
	})
}

// Helper function to get user-friendly validation error messages
func getValidationErrorMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return fe.Field() + " is required"
	case "email":
		return fe.Field() + " must be a valid email address"
	case "min":
		return fe.Field() + " must be at least " + fe.Param() + " characters long"
	default:
		return fe.Field() + " is invalid"
	}
}
