package repository

import (
	"errors"
	"time"

	"github.com/HMZ-H/moviemate/internal/domain"
	"gorm.io/gorm"
)

type GormRepo struct {
	db *gorm.DB
}

func NewGormRepo(db *gorm.DB) *GormRepo {
	return &GormRepo{db: db}
}

// Users
func (r *GormRepo) Create(user *domain.User) error {
	return r.db.Create(user).Error
}

func (r *GormRepo) CreateUser(user *domain.User) error {
	return r.db.Create(user).Error
}

func (r *GormRepo) GetByID(id uint) (*domain.User, error) {
	var user domain.User
	if err := r.db.Preload("Watchlist").First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *GormRepo) GetUserByID(id uint) (*domain.User, error) {
	return r.GetByID(id)
}

func (r *GormRepo) GetByUsername(username string) (*domain.User, error) {
	var user domain.User
	if err := r.db.Preload("Watchlist").Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *GormRepo) GetByEmail(email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.Preload("Watchlist").Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// Movies

func (r *GormRepo) CreateMovie(movie *domain.Movie) error {
	return r.db.Create(movie).Error
}

func (r *GormRepo) GetMovieByID(id uint) (*domain.Movie, error) {
	var movie domain.Movie
	if err := r.db.First(&movie, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &movie, nil
}

func (r *GormRepo) GetMovieByTitle(title string) (*domain.Movie, error) {
	var movie domain.Movie
	if err := r.db.Where("title = ?", title).First(&movie).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &movie, nil
}

func (r *GormRepo) ListMovies(limit, offset int) ([]domain.Movie, error) {
	var movies []domain.Movie
	if err := r.db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&movies).Error; err != nil {
		return nil, err
	}
	return movies, nil
}

// Watchlist
func (r *GormRepo) AddWatchlist(item *domain.WatchlistItem) error {
	item.AddedAt = time.Now()
	return r.db.Create(item).Error
}
func (r *GormRepo) RemoveWatchlist(userID, movieID uint) error {
	return r.db.Where("user_id = ? AND movie_id = ?", userID, movieID).Delete(&domain.WatchlistItem{}).Error
}
func (r *GormRepo) ListWatchlistByUser(userID uint) ([]domain.Movie, error) {
	var movies []domain.Movie
	// join watchlist -> movies
	if err := r.db.
		Model(&domain.Movie{}).
		Joins("join watchlist_items on watchlist_items.movie_id = movies.id").
		Where("watchlist_items.user_id = ?", userID).
		Find(&movies).Error; err != nil {
		return nil, err
	}
	return movies, nil
}

// ListWatchlistIDsByUser returns TMDB movie IDs stored in watchlist_items.movie_id
func (r *GormRepo) ListWatchlistIDsByUser(userID uint) ([]uint, error) {
	var ids []uint
	if err := r.db.Model(&domain.WatchlistItem{}).
		Where("user_id = ?", userID).
		Pluck("movie_id", &ids).Error; err != nil {
		return nil, err
	}
	return ids, nil
}
