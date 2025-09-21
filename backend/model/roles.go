package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// UintArray represents a slice of uint for JSON storage
type UintArray []uint

// Value implements the driver.Valuer interface
func (u UintArray) Value() (driver.Value, error) {
	return json.Marshal(u)
}

// Scan implements the sql.Scanner interface
func (u *UintArray) Scan(value interface{}) error {
	if value == nil {
		*u = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return gorm.ErrInvalidData
	}

	return json.Unmarshal(bytes, u)
}

// Role represents a user role with specific permissions
type Role struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"unique;not null"`
	Description string
	IsActive    bool      `gorm:"default:true"`
	Permissions UintArray `gorm:"type:jsonb"` // Array of permission IDs
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt
}

// RoleModel handles role database operations
type RoleModel struct {
	db *gorm.DB
}

func NewRoleModel(db *gorm.DB) *RoleModel {
	return &RoleModel{
		db: db,
	}
}

// Predefined roles with their permissions
var predefinedRoles = map[string]Role{
	"EMPLOYEE": {
		ID:          1,
		Name:        "EMPLOYEE",
		Description: "Regular employee with basic permissions",
		IsActive:    true,
		Permissions: UintArray{1, 5, 10, 13, 16, 23}, // ASK_LEAVE, VIEW_LEAVE_REQUESTS, EDIT_PROFILE, VIEW_TEAMS, VIEW_ROLES, READ_USERS
	},
	"TEAM_LEAD": {
		ID:          2,
		Name:        "TEAM_LEAD",
		Description: "Team leader with team management permissions",
		IsActive:    true,
		Permissions: UintArray{1, 2, 5, 6, 9, 10, 11, 13, 16, 17, 23, 24}, // All employee permissions + team lead specific + READ_USERS, UPDATE_USERS
	},
	"HR": {
		ID:          3,
		Name:        "HR",
		Description: "Human Resources with HR-specific permissions",
		IsActive:    true,
		Permissions: UintArray{1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 22, 23, 24}, // HR permissions + CREATE_USERS, READ_USERS, UPDATE_USERS
	},
	"MANAGEMENT": {
		ID:          4,
		Name:        "MANAGEMENT",
		Description: "Management with high-level permissions",
		IsActive:    true,
		Permissions: UintArray{1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25}, // Management permissions + all user CRUD
	},
	"ADMIN": {
		ID:          5,
		Name:        "ADMIN",
		Description: "System administrator with all permissions",
		IsActive:    true,
		Permissions: UintArray{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25}, // All permissions including user CRUD
	},
}

// GetRoleByName returns a role by its name
func GetRoleByName(name string) (Role, error) {
	role, ok := predefinedRoles[name]
	if !ok {
		return Role{}, gorm.ErrRecordNotFound
	}
	return role, nil
}

// GetRoleByID returns a role by its ID
func GetRoleByID(id uint) (Role, error) {
	for _, role := range predefinedRoles {
		if role.ID == id {
			return role, nil
		}
	}
	return Role{}, gorm.ErrRecordNotFound
}

// GetAllRoles returns all predefined roles
func GetAllRoles() map[string]Role {
	return predefinedRoles
}

// GetRolePermissions returns permissions for a specific role
func GetRolePermissions(roleID uint) ([]Permission, error) {
	role, err := GetRoleByID(roleID)
	if err != nil {
		return nil, err
	}

	var permissions []Permission
	for _, permID := range role.Permissions {
		if perm, err := GetPermissionByID(permID); err == nil {
			permissions = append(permissions, perm)
		}
	}
	return permissions, nil
}

// HasRolePermission checks if a role has a specific permission
func HasRolePermission(roleID uint, permissionKey string) bool {
	role, err := GetRoleByID(roleID)
	if err != nil {
		return false
	}

	perm, err := GetPermissionByKey(permissionKey)
	if err != nil {
		return false
	}

	for _, rolePerm := range role.Permissions {
		if rolePerm == perm.Id {
			return true
		}
	}
	return false
}

// CreateRole creates a new role in the database
func (r *RoleModel) CreateRole(role *Role) error {
	return r.db.Create(role).Error
}

// GetRole retrieves a role from the database
func (r *RoleModel) GetRole(id uint) (*Role, error) {
	var role Role
	if err := r.db.First(&role, id).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

// GetAllRoles retrieves all roles from the database
func (r *RoleModel) GetAllRoles() ([]Role, error) {
	var roles []Role
	if err := r.db.Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

// UpdateRole updates a role in the database
func (r *RoleModel) UpdateRole(role *Role) error {
	return r.db.Save(role).Error
}

// DeleteRole soft deletes a role
func (r *RoleModel) DeleteRole(id uint) error {
	return r.db.Delete(&Role{}, id).Error
}
