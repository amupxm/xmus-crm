package service

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// GetDBConnection returns a gorm.DB connection to the MySQL database as specified in podman-compose.
func GetDBConnection() (*gorm.DB, error) {
	// Format: host=HOST user=USER password=PASSWORD dbname=DBNAME port=PORT sslmode=disable TimeZone=Asia/Shanghai
	dsn := "host=localhost user=postgres password=postgres dbname=xmus-crm port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(
		postgres.Open(dsn),
		&gorm.Config{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	return db, nil
}
