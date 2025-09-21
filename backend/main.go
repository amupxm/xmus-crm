package main

import (
	"github.com/amupxm/xmus-crm/backend/api"
	"github.com/amupxm/xmus-crm/backend/middleware"
	"github.com/amupxm/xmus-crm/backend/model"
	"github.com/amupxm/xmus-crm/backend/service"
	"github.com/gin-gonic/gin"
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
	if err := router.Run(":9090"); err != nil {
		log.Fatal(err)
	}
}
