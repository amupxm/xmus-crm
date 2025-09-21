package model

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID                 uint   `gorm:"primaryKey"`
	Email              string `gorm:"unique;not null"`
	Password           string `gorm:"not null"`
	FirstName          string `gorm:"not null"`
	LastName           string `gorm:"not null"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
	DeletedAt          gorm.DeletedAt
	IsActiveUser       bool    `gorm:"default:true"`
	Salary             float64 `gorm:"not null"`
	SalaryCurrency     string  `gorm:"not null"`
	TeamID             uint    `gorm:"not null"`
	RoleID             uint    `gorm:"not null"`
	PermissionGroupID  uint    `gorm:"not null"`
	LastLoginTime      *time.Time
	RefreshToken       string
	RefreshTokenExpiry *time.Time
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
		Email:             "amupxm@gmail.com",
		Password:          hashedPassword,
		FirstName:         "amup",
		LastName:          "mokarrami",
		IsActiveUser:      true,
		Salary:            50000.0,
		SalaryCurrency:    "USD",
		TeamID:            1,
		RoleID:            1,
		PermissionGroupID: 1,
	}

	if err := u.CreateNewUser(user); err != nil {
		return nil, err
	}

	return user, nil
}
