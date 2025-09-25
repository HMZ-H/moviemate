package domain

import "time"

type User struct {
	ID        uint   `gorm:"primaryKey"`
	Username  string `gorm:"uniqueIndex;size:100;not null"`
	Email     string `gorm:"uniqueIndex;size:200"`
	Password  string `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Watchlist []WatchlistItem `gorm:"foreignKey:UserID"`
	// optionally add Watched []WatchedItem
}

type Movie struct {
	ID          uint   `gorm:"primaryKey"`
	Title       string `gorm:"uniqueIndex;size:300;not null"`
	Description string `gorm:"type:text"`
	Year        int
	Genres      string `gorm:"size:200"` // CSV for simplicity
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type WatchlistItem struct {
	ID      uint `gorm:"primaryKey"`
	UserID  uint `gorm:"index:idx_user_movie,unique;not null"`
	MovieID uint `gorm:"index:idx_user_movie,unique;not null"`
	AddedAt time.Time
}

// Chat domain interfaces
type ChatService interface {
	GenerateReply(prompt string) (string, error)
}
