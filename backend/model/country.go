package model

import (
	"time"

	"gorm.io/gorm"
)

// Country represents a country in the system
type Country struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"unique;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// CountryModel handles country database operations
type CountryModel struct {
	db *gorm.DB
}

func NewCountryModel(db *gorm.DB) *CountryModel {
	return &CountryModel{
		db: db,
	}
}

// Predefined countries
var predefinedCountries = map[uint]Country{
	1: {
		ID:   1,
		Name: "Indonesia",
	},
	2: {
		ID:   2,
		Name: "Vietnam",
	},
	3: {
		ID:   3,
		Name: "Thailand",
	},
}

// GetCountryByID returns a country by its ID
func GetCountryByID(id uint) (Country, error) {
	country, ok := predefinedCountries[id]
	if !ok {
		return Country{}, gorm.ErrRecordNotFound
	}
	return country, nil
}

// GetAllCountries returns all predefined countries
func GetAllCountries() map[uint]Country {
	return predefinedCountries
}

// CreateCountry creates a new country in the database
func (c *CountryModel) CreateCountry(country *Country) error {
	return c.db.Create(country).Error
}

// GetCountry retrieves a country from the database
func (c *CountryModel) GetCountry(id uint) (*Country, error) {
	var country Country
	if err := c.db.First(&country, id).Error; err != nil {
		return nil, err
	}
	return &country, nil
}

// GetAllCountries retrieves all countries from the database
func (c *CountryModel) GetAllCountries() ([]Country, error) {
	var countries []Country
	if err := c.db.Find(&countries).Error; err != nil {
		return nil, err
	}
	return countries, nil
}

// UpdateCountry updates a country in the database
func (c *CountryModel) UpdateCountry(country *Country) error {
	return c.db.Save(country).Error
}

// DeleteCountry soft deletes a country
func (c *CountryModel) DeleteCountry(id uint) error {
	return c.db.Delete(&Country{}, id).Error
}
