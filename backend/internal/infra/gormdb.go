package infra

import (
	"fmt"
	"os"
	"time"

	"github.com/HMZ-H/moviemate/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// NewDB connects to Postgres using DATABASE_URL and runs migrations.
func NewDB() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	// tune pool
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetConnMaxLifetime(30 * time.Minute)
	}
	// minimal migrations
	if err := db.AutoMigrate(&domain.User{}, &domain.Movie{}, &domain.WatchlistItem{}); err != nil {
		return nil, err
	}
	return db, nil
}
