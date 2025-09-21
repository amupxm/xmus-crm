package model

// now we mock the database since the data is almost static
// later we can implement real database model for it :

import "gorm.io/gorm"

var projectsList = map[uint]string{
	1: "zeststack",
	2: "modcard",
}

type projectModel struct {
	db *gorm.DB
}

func NewProjectModel(db *gorm.DB) *projectModel {
	return &projectModel{
		db: db,
	}
}

func GetProjectByID(id uint) (string, error) {
	project, ok := projectsList[id]
	if !ok {
		return "", gorm.ErrRecordNotFound
	}
	return project, nil
}
