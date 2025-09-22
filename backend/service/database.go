package service

import (
	"context"
	"fmt"
	"time"

	xmuslogger "github.com/amupxm/xmus-logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// GormLoggerWrapper wraps xmus logger to implement gorm.Interface
type GormLoggerWrapper struct {
	logger *xmuslogger.Logger
	level  logger.LogLevel
}

// NewGormLoggerWrapper creates a new GORM logger wrapper
func NewGormLoggerWrapper(log *xmuslogger.Logger) *GormLoggerWrapper {
	return &GormLoggerWrapper{
		logger: log,
		level:  logger.Info, // Default log level
	}
}

// LogMode sets the log level
func (g *GormLoggerWrapper) LogMode(level logger.LogLevel) logger.Interface {
	return &GormLoggerWrapper{
		logger: g.logger,
		level:  level,
	}
}

// Info logs info level messages
func (g *GormLoggerWrapper) Info(ctx context.Context, msg string, data ...interface{}) {
	if g.level >= logger.Info {
		g.logger.Info().Msg(fmt.Sprintf(msg, data...))
	}
}

// Warn logs warning level messages
func (g *GormLoggerWrapper) Warn(ctx context.Context, msg string, data ...interface{}) {
	if g.level >= logger.Warn {
		g.logger.Warn().Msg(fmt.Sprintf(msg, data...))
	}
}

// Error logs error level messages
func (g *GormLoggerWrapper) Error(ctx context.Context, msg string, data ...interface{}) {
	if g.level >= logger.Error {
		g.logger.Error().Msg(fmt.Sprintf(msg, data...))
	}
}

// Trace logs SQL queries and execution time
func (g *GormLoggerWrapper) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if g.level <= logger.Silent {
		return
	}

	elapsed := time.Since(begin)
	sql, rows := fc()

	if err != nil && g.level >= logger.Error {
		g.logger.Error().
			Str("sql", sql).
			Int("rows", int(rows)).
			Str("duration_ms", fmt.Sprintf("%.3f", float64(elapsed.Nanoseconds())/1e6)).
			Err(err).
			Msg("SQL query failed")
	} else if elapsed > 200*time.Millisecond && g.level >= logger.Warn {
		g.logger.Warn().
			Str("sql", sql).
			Int("rows", int(rows)).
			Str("duration_ms", fmt.Sprintf("%.3f", float64(elapsed.Nanoseconds())/1e6)).
			Msg("Slow SQL query")
	} else if g.level == logger.Info {
		g.logger.Info().
			Str("sql", sql).
			Int("rows", int(rows)).
			Str("duration_ms", fmt.Sprintf("%.3f", float64(elapsed.Nanoseconds())/1e6)).
			Msg("SQL query executed")
	}
}

// GetDBConnection returns a gorm.DB connection to the PostgreSQL database as specified in podman-compose.
func GetDBConnection(log *xmuslogger.Logger) (*gorm.DB, error) {
	// Format: host=HOST user=USER password=PASSWORD dbname=DBNAME port=PORT sslmode=disable TimeZone=Asia/Shanghai
	dsn := "host=localhost user=postgres password=postgres dbname=xmus-crm port=5432 sslmode=disable TimeZone=Asia/Shanghai"

	// Create GORM logger wrapper
	gormLogger := NewGormLoggerWrapper(log)

	db, err := gorm.Open(
		postgres.Open(dsn),
		&gorm.Config{
			Logger: gormLogger,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	return db, nil
}
