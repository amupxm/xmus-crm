package model

import "gorm.io/gorm"

// now we mock the database since the data is almost static
// later we can implement real database model for it :

var countriesLits = map[uint]string{
	1: "Indonesia", 2: "Vietnam", 3: "Thailand",
}

type countryModel struct {
	db *gorm.DB
}

func NewCountryModel(db *gorm.DB) *countryModel {
	return &countryModel{
		db: db,
	}
}

func GetCountryByID(id uint) (string, error) {
	country, ok := countriesLits[id]
	if !ok {
		return "", gorm.ErrRecordNotFound
	}
	return country, nil

}
