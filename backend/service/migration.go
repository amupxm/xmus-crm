package service

import (
	"time"

	"github.com/amupxm/xmus-crm/backend/model"
	"gorm.io/gorm"
)

// Migration handles database migrations and seeding
type Migration struct {
	db *gorm.DB
}

// NewMigration creates a new migration instance
func NewMigration(db *gorm.DB) *Migration {
	return &Migration{
		db: db,
	}
}

// RunMigration runs all migrations and seeds the database with predefined data
func (m *Migration) RunMigration() error {
	// Migrate permissions
	if err := m.migratePermissions(); err != nil {
		return err
	}

	// Migrate roles
	if err := m.migrateRoles(); err != nil {
		return err
	}

	// Migrate countries
	if err := m.migrateCountries(); err != nil {
		return err
	}

	// Migrate teams
	if err := m.migrateTeams(); err != nil {
		return err
	}

	return nil
}

// migratePermissions inserts all predefined permissions into the database
func (m *Migration) migratePermissions() error {
	permissions := model.GetAllPermissions()

	for _, perm := range permissions {
		// Check if permission already exists
		var existing model.Permission
		if err := m.db.Where("id = ?", perm.Id).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Permission doesn't exist, create it
				if err := m.db.Create(&perm).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		}
	}

	return nil
}

// migrateRoles inserts all predefined roles into the database
func (m *Migration) migrateRoles() error {
	roles := model.GetAllRoles()
	now := time.Now()

	for _, role := range roles {
		// Check if role already exists
		var existing model.Role
		if err := m.db.Where("id = ?", role.ID).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Role doesn't exist, create it
				role.CreatedAt = now
				role.UpdatedAt = now
				if err := m.db.Create(&role).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		} else {
			// Role exists, update it
			role.CreatedAt = existing.CreatedAt
			role.UpdatedAt = now
			if err := m.db.Save(&role).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

// migrateCountries inserts all predefined countries into the database
func (m *Migration) migrateCountries() error {
	countries := model.GetAllCountries()
	now := time.Now()

	for _, country := range countries {
		// Check if country already exists
		var existing model.Country
		if err := m.db.Where("id = ?", country.ID).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Country doesn't exist, create it
				country.CreatedAt = now
				country.UpdatedAt = now
				if err := m.db.Create(&country).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		} else {
			// Country exists, update it
			country.CreatedAt = existing.CreatedAt
			country.UpdatedAt = now
			if err := m.db.Save(&country).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

// migrateTeams inserts all predefined teams into the database
func (m *Migration) migrateTeams() error {
	teams := model.GetAllTeams()
	now := time.Now()

	for _, team := range teams {
		// Check if team already exists
		var existing model.Team
		if err := m.db.Where("id = ?", team.ID).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Team doesn't exist, create it
				team.CreatedAt = now
				team.UpdatedAt = now
				if err := m.db.Create(&team).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		} else {
			// Team exists, update it
			team.CreatedAt = existing.CreatedAt
			team.UpdatedAt = now
			if err := m.db.Save(&team).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
