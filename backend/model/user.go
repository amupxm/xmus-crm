package model

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID             uint   `gorm:"primaryKey"`
	Email          string `gorm:"unique;not null"`
	Password       string `gorm:"not null"`
	FirstName      string `gorm:"not null"`
	LastName       string `gorm:"not null"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt
	IsActiveUser   bool    `gorm:"default:true"`
	Salary         float64 `gorm:"not null"`
	SalaryCurrency string  `gorm:"not null"`

	// Role and Team relationships
	Roles         []Role `gorm:"many2many:user_roles;"`
	Teams         []Team `gorm:"many2many:team_members;"`
	PrimaryRoleID uint   `gorm:"not null"` // Main role for the user
	PrimaryTeamID uint   `gorm:"not null"` // Main team for the user

	// Authentication
	LastLoginTime      *time.Time
	RefreshToken       string
	RefreshTokenExpiry *time.Time

	// Relationships (commented out to avoid circular dependency)
	// PrimaryRole Role `gorm:"foreignKey:PrimaryRoleID"`
	// PrimaryTeam Team `gorm:"foreignKey:PrimaryTeamID"`
}
type UserModel struct {
	db *gorm.DB
}

func NewUserModel(db *gorm.DB) *UserModel {
	return &UserModel{
		db: db,
	}
}

func (u *UserModel) CreateNewUser(user *User) error {
	if err := u.db.Create(user).Error; err != nil {
		return err
	}
	return nil
}

func (u *UserModel) GetAllUsers() ([]User, error) {
	var users []User
	if err := u.db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (u *UserModel) GetUserByEmail(email string) (*User, error) {
	var user User
	if err := u.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *UserModel) GetUserByID(id uint) (*User, error) {
	var user User
	if err := u.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// HashPassword hashes a plain text password using bcrypt
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// VerifyPassword compares a plain text password with a hashed password
func VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// CreateTestUser creates a test user for development/testing purposes
func (u *UserModel) CreateTestUser() (*User, error) {
	hashedPassword, err := HashPassword("1202212022")
	if err != nil {
		return nil, err
	}

	user := &User{
		Email:          "amupxm@gmail.com",
		Password:       hashedPassword,
		FirstName:      "amup",
		LastName:       "mokarrami",
		IsActiveUser:   true,
		Salary:         50000.0,
		SalaryCurrency: "USD",
		PrimaryRoleID:  5, // ADMIN role
		PrimaryTeamID:  1, // ADMIN_TEAM
	}

	if err := u.CreateNewUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserPermissions returns all permissions for a user based on their roles
func (u *UserModel) GetUserPermissions(userID uint) ([]Permission, error) {
	var user User
	if err := u.db.Preload("Roles").First(&user, userID).Error; err != nil {
		return nil, err
	}

	var allPermissions []Permission
	permissionMap := make(map[uint]bool) // To avoid duplicates

	for _, role := range user.Roles {
		rolePermissions, err := GetRolePermissions(role.ID)
		if err != nil {
			continue
		}

		for _, perm := range rolePermissions {
			if !permissionMap[perm.Id] {
				allPermissions = append(allPermissions, perm)
				permissionMap[perm.Id] = true
			}
		}
	}

	return allPermissions, nil
}

// HasUserPermission checks if a user has a specific permission
func (u *UserModel) HasUserPermission(userID uint, permissionKey string) (bool, error) {
	permissions, err := u.GetUserPermissions(userID)
	if err != nil {
		return false, err
	}

	for _, perm := range permissions {
		if perm.Key == permissionKey {
			return true, nil
		}
	}
	return false, nil
}

// IsUserTeamLead checks if a user is a team lead
func (u *UserModel) IsUserTeamLead(userID uint) (bool, error) {
	var count int64
	if err := u.db.Model(&Team{}).Where("team_lead_id = ?", userID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetUserTeams returns all teams a user belongs to
func (u *UserModel) GetUserTeams(userID uint) ([]Team, error) {
	var user User
	if err := u.db.Preload("Teams").First(&user, userID).Error; err != nil {
		return nil, err
	}
	return user.Teams, nil
}

// GetUserRoles returns all roles a user has
func (u *UserModel) GetUserRoles(userID uint) ([]Role, error) {
	var user User
	if err := u.db.Preload("Roles").First(&user, userID).Error; err != nil {
		return nil, err
	}
	return user.Roles, nil
}

// AssignRoleToUser assigns a role to a user
func (u *UserModel) AssignRoleToUser(userID, roleID uint) error {
	var user User
	var role Role

	if err := u.db.First(&user, userID).Error; err != nil {
		return err
	}

	if err := u.db.First(&role, roleID).Error; err != nil {
		return err
	}

	return u.db.Model(&user).Association("Roles").Append(&role)
}

// RemoveRoleFromUser removes a role from a user
func (u *UserModel) RemoveRoleFromUser(userID, roleID uint) error {
	var user User
	var role Role

	if err := u.db.First(&user, userID).Error; err != nil {
		return err
	}

	if err := u.db.First(&role, roleID).Error; err != nil {
		return err
	}

	return u.db.Model(&user).Association("Roles").Delete(&role)
}

// AddUserToTeam adds a user to a team
func (u *UserModel) AddUserToTeam(userID, teamID uint) error {
	var user User
	var team Team

	if err := u.db.First(&user, userID).Error; err != nil {
		return err
	}

	if err := u.db.First(&team, teamID).Error; err != nil {
		return err
	}

	return u.db.Model(&user).Association("Teams").Append(&team)
}

// RemoveUserFromTeam removes a user from a team
func (u *UserModel) RemoveUserFromTeam(userID, teamID uint) error {
	var user User
	var team Team

	if err := u.db.First(&user, userID).Error; err != nil {
		return err
	}

	if err := u.db.First(&team, teamID).Error; err != nil {
		return err
	}

	return u.db.Model(&user).Association("Teams").Delete(&team)
}

// SetPrimaryRole sets the primary role for a user
func (u *UserModel) SetPrimaryRole(userID, roleID uint) error {
	return u.db.Model(&User{}).Where("id = ?", userID).Update("primary_role_id", roleID).Error
}

// SetPrimaryTeam sets the primary team for a user
func (u *UserModel) SetPrimaryTeam(userID, teamID uint) error {
	return u.db.Model(&User{}).Where("id = ?", userID).Update("primary_team_id", teamID).Error
}

// GetUsersByRole returns all users with a specific role
func (u *UserModel) GetUsersByRole(roleID uint) ([]User, error) {
	var users []User
	if err := u.db.Joins("JOIN user_roles ON users.id = user_roles.user_id").
		Where("user_roles.role_id = ?", roleID).
		Preload("Roles").Preload("Teams").
		Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// GetUsersByTeam returns all users in a specific team
func (u *UserModel) GetUsersByTeam(teamID uint) ([]User, error) {
	var users []User
	if err := u.db.Joins("JOIN team_members ON users.id = team_members.user_id").
		Where("team_members.team_id = ?", teamID).
		Preload("Roles").Preload("Teams").
		Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// GetTeamLeads returns all users who are team leads
func (u *UserModel) GetTeamLeads() ([]User, error) {
	var users []User
	if err := u.db.Joins("JOIN teams ON users.id = teams.team_lead_id").
		Preload("Roles").Preload("Teams").
		Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// UpdateUser updates a user in the database
func (u *UserModel) UpdateUser(user *User) error {
	return u.db.Save(user).Error
}

// DeleteUser soft deletes a user
func (u *UserModel) DeleteUser(id uint) error {
	return u.db.Delete(&User{}, id).Error
}
