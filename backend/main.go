package main

import (
	"github.com/amupxm/xmus-crm/backend/api"
	"github.com/amupxm/xmus-crm/backend/model"
	"github.com/amupxm/xmus-crm/backend/service"
)

func main() {
	log := service.InitLogger()
	db, err := service.GetDBConnection()
	if err != nil {
		log.Error().Err(err).Msg("error while init the database")
	}

	// Auto-migrate the database schema
	if err := db.AutoMigrate(&model.User{}); err != nil {
		log.Error().Err(err).Msg("failed to migrate database")
	}

	router := service.InitGinRouter()
	router.GET("/health", func(c *service.GinContext) {
		c.JSON(200, map[string]string{"status": "ok"})
	})

	// Initialize API routes
	apiGroup := router.Group("/api/v1")
	authAPI := api.NewAuthAPI(db)
	authAPI.RegisterRoutes(apiGroup)

	// Create a test user if none exists
	// userModel := model.NewUserModel(db)
	// users, err := userModel.GetAllUsers()
	// if err != nil {
	// 	log.Error().Err(err).Msg("failed to fetch users")
	// }

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
	if err := router.Run(":9090"); err != nil {
		log.Fatal(err)
	}
}
