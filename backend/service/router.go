package service

import (
	"github.com/gin-gonic/gin"
)

type GinContext = gin.Context

func InitGinRouter() *gin.Engine {
	router := gin.Default()
	return router
}
