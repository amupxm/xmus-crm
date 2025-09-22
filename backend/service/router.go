package service

import (
	xmuslogger "github.com/amupxm/xmus-logger"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type GinContext = gin.Context

func CustomLogger(log *xmuslogger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Info().Str("path", c.Request.URL.Path).Str("method", c.Request.Method).Str("ip", c.ClientIP()).Int("status", c.Writer.Status()).Msg("Request received")
		c.Next()
	}
}

func InitGinRouter(log *xmuslogger.Logger) *gin.Engine {
	router := gin.New()
	router.Use(CustomLogger(log))
	// Configure CORS to allow all origins
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true

	router.Use(cors.New(config))

	return router
}
