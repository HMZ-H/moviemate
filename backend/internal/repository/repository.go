package repository

import (
	"github.com/HMZ-H/moviemate/internal/domain"
)

type MovieRepo interface {
	CreateMovie(movie *domain.Movie) error
	GetMovieByID(id uint) (*domain.Movie, error)
	GetMovieByTitle(title string) (*domain.Movie, error)
	ListMovies(limit, offset int) ([]domain.Movie, error)
}

type UserRepo interface {
	Create(user *domain.User) error
	GetByID(id uint) (*domain.User, error)
	GetByUsername(username string) (*domain.User, error)
	GetByEmail(email string) (*domain.User, error)
}

// Combined repository interface
type Repository interface {
	UserRepo
	MovieRepo
	WatchlistRepo
}

type WatchlistRepo interface {
	AddWatchlist(item *domain.WatchlistItem) error
	RemoveWatchlist(userID, movieID uint) error
	ListWatchlistByUser(userID uint) ([]domain.Movie, error) // returns movie objects
	ListWatchlistIDsByUser(userID uint) ([]uint, error)      // returns TMDB movie IDs
	GetUserByID(id uint) (*domain.User, error)
	CreateUser(user *domain.User) error
}
