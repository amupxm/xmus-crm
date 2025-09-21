package model

import (
	"time"

	"gorm.io/gorm"
)

// Permission represents a system permission
type Permission struct {
	Id          uint   `gorm:"primaryKey"`
	Key         string `gorm:"unique;not null"`
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}

var permissions = map[uint]Permission{
	// Leave Management Permissions
	1: {
		Id:          1,
		Key:         "ASK_LEAVE",
		Description: "user can ask for leave request",
	},
	2: {
		Id:          2,
		Key:         "APPROVE_LEAVE_TEAM",
		Description: "team lead can approve leave requests for team members",
	},
	3: {
		Id:          3,
		Key:         "APPROVE_LEAVE_HR",
		Description: "HR can approve leave requests after team lead approval",
	},
	4: {
		Id:          4,
		Key:         "APPROVE_LEAVE_MANAGEMENT",
		Description: "Management can approve leave requests after HR approval",
	},
	5: {
		Id:          5,
		Key:         "VIEW_LEAVE_REQUESTS",
		Description: "user can view leave requests",
	},
	6: {
		Id:          6,
		Key:         "VIEW_LEAVE_REPORTS",
		Description: "user can view leave reports and analytics",
	},
	7: {
		Id:          7,
		Key:         "MANAGE_LEAVE_POLICIES",
		Description: "user can manage leave policies and rules",
	},

	// User Management Permissions
	8: {
		Id:          8,
		Key:         "MANAGE_USERS",
		Description: "user can manage other users",
	},
	9: {
		Id:          9,
		Key:         "VIEW_USERS",
		Description: "user can view other users",
	},
	10: {
		Id:          10,
		Key:         "EDIT_PROFILE",
		Description: "user can edit their profile",
	},
	11: {
		Id:          11,
		Key:         "EDIT_OTHER_PROFILES",
		Description: "user can edit other users' profiles",
	},
	22: {
		Id:          22,
		Key:         "CREATE_USERS",
		Description: "user can create new users",
	},
	23: {
		Id:          23,
		Key:         "READ_USERS",
		Description: "user can read user information",
	},
	24: {
		Id:          24,
		Key:         "UPDATE_USERS",
		Description: "user can update user information",
	},
	25: {
		Id:          25,
		Key:         "DELETE_USERS",
		Description: "user can delete users",
	},

	// Team Management Permissions
	12: {
		Id:          12,
		Key:         "MANAGE_TEAMS",
		Description: "user can manage teams",
	},
	13: {
		Id:          13,
		Key:         "VIEW_TEAMS",
		Description: "user can view teams",
	},
	14: {
		Id:          14,
		Key:         "ASSIGN_TEAM_LEAD",
		Description: "user can assign team leads",
	},

	// Role Management Permissions
	15: {
		Id:          15,
		Key:         "MANAGE_ROLES",
		Description: "user can manage roles and permissions",
	},
	16: {
		Id:          16,
		Key:         "VIEW_ROLES",
		Description: "user can view roles and permissions",
	},

	// Reports and Analytics
	17: {
		Id:          17,
		Key:         "VIEW_REPORTS",
		Description: "user can view reports",
	},
	18: {
		Id:          18,
		Key:         "VIEW_ANALYTICS",
		Description: "user can view analytics and dashboards",
	},
	19: {
		Id:          19,
		Key:         "EXPORT_DATA",
		Description: "user can export data and reports",
	},

	// System Administration
	20: {
		Id:          20,
		Key:         "SYSTEM_ADMIN",
		Description: "user has system administration privileges",
	},
	21: {
		Id:          21,
		Key:         "AUDIT_LOGS",
		Description: "user can view audit logs",
	},
}

type permissionModel struct {
	db *gorm.DB
}

func NewPermissionModel(db *gorm.DB) *permissionModel {
	return &permissionModel{
		db: db,
	}
}

func GetPermissionByID(id uint) (Permission, error) {
	perm, ok := permissions[id]
	if !ok {
		return Permission{}, gorm.ErrRecordNotFound
	}
	return perm, nil
}

func GetAllPermissions() map[uint]Permission {
	return permissions
}

func GetPermissionsByKeys(keys []string) []Permission {
	var result []Permission
	for _, perm := range permissions {
		for _, key := range keys {
			if perm.Key == key {
				result = append(result, perm)
				break
			}
		}
	}
	return result
}

func GetPermissionByKey(key string) (Permission, error) {
	for _, perm := range permissions {
		if perm.Key == key {
			return perm, nil
		}
	}
	return Permission{}, gorm.ErrRecordNotFound
}

func HasPermission(userPermissions []uint, permissionKey string) bool {
	perm, err := GetPermissionByKey(permissionKey)
	if err != nil {
		return false
	}

	for _, userPerm := range userPermissions {
		if userPerm == perm.Id {
			return true
		}
	}
	return false
}
