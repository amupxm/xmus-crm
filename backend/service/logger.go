package service

import xmuslogger "github.com/amupxm/xmus-logger"

func InitLogger() *xmuslogger.Logger {
	log := xmuslogger.New()
	return log
}
