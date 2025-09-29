package model

import (
	"time"

	"gorm.io/gorm"
)

// Team represents a team with members and a team lead
type Team struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"unique;not null" json:"name"`
	Description string         `json:"description"`
	TeamLeadID  uint           `gorm:"not null" json:"team_lead_id"` // Foreign key to User ID
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty"`

	// Relationships (commented out to avoid circular dependency)
	// TeamLead   User   `gorm:"foreignKey:TeamLeadID"`
	// Members    []User `gorm:"many2many:team_members;"`
}

// TeamMember represents the many-to-many relationship between teams and users
type TeamMember struct {
	TeamID   uint      `gorm:"primaryKey" json:"team_id"`
	UserID   uint      `gorm:"primaryKey" json:"user_id"`
	JoinedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"joined_at"`
}

// TeamModel handles team database operations
type TeamModel struct {
	db *gorm.DB
}

func NewTeamModel(db *gorm.DB) *TeamModel {
	return &TeamModel{
		db: db,
	}
}

// Predefined teams for the system
var predefinedTeams = map[uint]Team{
	1: {
		ID:          1,
		Name:        "ADMIN_TEAM",
		Description: "System administration team",
		TeamLeadID:  1, // Will be set when admin user is created
		IsActive:    true,
	},
	2: {
		ID:          2,
		Name:        "HR_TEAM",
		Description: "Human Resources team",
		TeamLeadID:  0, // Will be set when HR team lead is assigned
		IsActive:    true,
	},
	3: {
		ID:          3,
		Name:        "MANAGEMENT_TEAM",
		Description: "Management team",
		TeamLeadID:  0, // Will be set when management team lead is assigned
		IsActive:    true,
	},
	4: {
		ID:          4,
		Name:        "DEVELOPMENT_TEAM",
		Description: "Software development team",
		TeamLeadID:  0, // Will be set when dev team lead is assigned
		IsActive:    true,
	},
	5: {
		ID:          5,
		Name:        "SALES_TEAM",
		Description: "Sales and marketing team",
		TeamLeadID:  0, // Will be set when sales team lead is assigned
		IsActive:    true,
	},
}

// GetTeamByID returns a team by its ID
func GetTeamByID(id uint) (Team, error) {
	team, ok := predefinedTeams[id]
	if !ok {
		return Team{}, gorm.ErrRecordNotFound
	}
	return team, nil
}

// GetTeamByName returns a team by its name
func GetTeamByName(name string) (Team, error) {
	for _, team := range predefinedTeams {
		if team.Name == name {
			return team, nil
		}
	}
	return Team{}, gorm.ErrRecordNotFound
}

// GetAllTeams returns all predefined teams
func GetAllTeams() map[uint]Team {
	return predefinedTeams
}

// IsTeamLead checks if a user is a team lead
func IsTeamLead(userID uint) bool {
	for _, team := range predefinedTeams {
		if team.TeamLeadID == userID {
			return true
		}
	}
	return false
}

// GetTeamLeadTeams returns all teams where the user is a team lead
func GetTeamLeadTeams(userID uint) []Team {
	var teams []Team
	for _, team := range predefinedTeams {
		if team.TeamLeadID == userID {
			teams = append(teams, team)
		}
	}
	return teams
}

// GetUserTeams returns all teams a user belongs to
func GetUserTeams(userID uint) []Team {
	var teams []Team
	// This would need to be implemented with proper database queries
	// For now, we'll return teams based on team lead status
	for _, team := range predefinedTeams {
		if team.TeamLeadID == userID {
			teams = append(teams, team)
		}
	}
	return teams
}

// CreateTeam creates a new team in the database
func (t *TeamModel) CreateTeam(team *Team) error {
	return t.db.Create(team).Error
}

// GetTeam retrieves a team from the database
func (t *TeamModel) GetTeam(id uint) (*Team, error) {
	var team Team
	if err := t.db.First(&team, id).Error; err != nil {
		return nil, err
	}
	return &team, nil
}

// GetAllTeams retrieves all teams from the database
func (t *TeamModel) GetAllTeams() ([]Team, error) {
	var teams []Team
	if err := t.db.Find(&teams).Error; err != nil {
		return nil, err
	}
	return teams, nil
}

// UpdateTeam updates a team in the database
func (t *TeamModel) UpdateTeam(team *Team) error {
	return t.db.Save(team).Error
}

// DeleteTeam soft deletes a team
func (t *TeamModel) DeleteTeam(id uint) error {
	return t.db.Delete(&Team{}, id).Error
}

// AssignTeamLead assigns a user as team lead
func (t *TeamModel) AssignTeamLead(teamID, userID uint) error {
	return t.db.Model(&Team{}).Where("id = ?", teamID).Update("team_lead_id", userID).Error
}

// AddTeamMember adds a user to a team
func (t *TeamModel) AddTeamMember(teamID, userID uint) error {
	teamMember := TeamMember{
		TeamID: teamID,
		UserID: userID,
	}
	return t.db.Create(&teamMember).Error
}

// RemoveTeamMember removes a user from a team
func (t *TeamModel) RemoveTeamMember(teamID, userID uint) error {
	return t.db.Where("team_id = ? AND user_id = ?", teamID, userID).Delete(&TeamMember{}).Error
}

// GetTeamMembers retrieves all members of a team
func (t *TeamModel) GetTeamMembers(teamID uint) ([]User, error) {
	var users []User
	if err := t.db.Table("users").
		Joins("JOIN team_members ON users.id = team_members.user_id").
		Where("team_members.team_id = ?", teamID).
		Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}
