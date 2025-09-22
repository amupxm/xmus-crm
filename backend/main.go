package main

import (
	"github.com/amupxm/xmus-crm/backend/api"
	"github.com/amupxm/xmus-crm/backend/middleware"
	"github.com/amupxm/xmus-crm/backend/model"
	"github.com/amupxm/xmus-crm/backend/service"
	"github.com/gin-gonic/gin"
)

func main() {
	// Migration flag - set to true to run migrations
	migration := true

	log := service.InitLogger()
	db, err := service.GetDBConnection(log)
	if err != nil {
		log.Error().Err(err).Msg("error while init the database")
	}

	// Drop existing tables and recreate them for clean migration
	if migration {
		log.Info().Msg("Dropping existing tables...")
		db.Exec("DROP TABLE IF EXISTS user_roles CASCADE")
		db.Exec("DROP TABLE IF EXISTS team_members CASCADE")
		db.Exec("DROP TABLE IF EXISTS users CASCADE")
		db.Exec("DROP TABLE IF EXISTS roles CASCADE")
		db.Exec("DROP TABLE IF EXISTS permissions CASCADE")
		db.Exec("DROP TABLE IF EXISTS countries CASCADE")
		db.Exec("DROP TABLE IF EXISTS teams CASCADE")
		db.Exec("DROP TABLE IF EXISTS leave_requests CASCADE")
	}

	// Auto-migrate the database schema
	if err := db.AutoMigrate(
		&model.User{},
		&model.Role{},
		&model.Permission{},
		&model.Country{},
		&model.Team{},
		&model.TeamMember{},
		&model.LeaveRequest{},
	); err != nil {
		log.Error().Err(err).Msg("failed to migrate database")
	}

	// Run migration if flag is set
	if migration {
		log.Info().Msg("Running database migration...")
		migrationService := service.NewMigration(db)
		if err := migrationService.RunMigration(); err != nil {
			log.Error().Err(err).Msg("failed to run migration")
		} else {
			log.Info().Msg("Database migration completed successfully")
		}
	}

	router := service.InitGinRouter(log)
	router.GET("/health", func(c *service.GinContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})

	// Initialize API routes
	apiGroup := router.Group("/api/v1")
	authAPI := api.NewAuthAPI(db)
	authAPI.RegisterRoutes(apiGroup)

	// Initialize User API
	userAPI := api.NewUserAPI(db)
	userAPI.SetupRoutes(apiGroup)

	// Initialize Permissions API
	permissionsAPI := api.NewPermissionAPI(db)
	permissionsAPI.SetupRoutes(apiGroup)

	// Protected routes example
	protected := apiGroup.Group("/protected")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile", func(c *service.GinContext) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(500, gin.H{"error": "User ID not found in context"})
				return
			}
			c.JSON(200, gin.H{
				"success": true,
				"message": "Access granted to protected route",
				"user_id": userID,
			})
		})
	}

	userModel := model.NewUserModel(db)
	userModel.CreateTestUser()

	// if len(users) == 0 {
	// 	log.Info().Msg("No users found, creating test user...")
	// 	testUser, err := userModel.CreateTestUser()
	// 	if err != nil {
	// 		log.Error().Err(err).Msg("failed to create test user")
	// 	} else {
	// 		log.Info().Str("email", testUser.Email).Msg("Test user created successfully")
	// 	}
	// }

	// usersJ, _ := json.Marshal(users)
	// log.Info().Msg(string(usersJ))
	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
