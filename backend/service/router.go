package service

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type GinContext = gin.Context

func InitGinRouter() *gin.Engine {
	router := gin.Default()

	// Configure CORS to allow all origins
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true

	router.Use(cors.New(config))

	return router
}
