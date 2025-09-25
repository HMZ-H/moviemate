package usecase

import (
	"errors"

	"github.com/HMZ-H/moviemate/internal/domain"
	"github.com/HMZ-H/moviemate/internal/repository"
)

type MovieUsecase struct {
	usersRepo     repository.UserRepo
	moviesRepo    repository.MovieRepo
	watchlistRepo repository.WatchlistRepo
}

func NewMovieUsecase(u repository.UserRepo, m repository.MovieRepo, w repository.WatchlistRepo) *MovieUsecase {
	return &MovieUsecase{usersRepo: u, moviesRepo: m, watchlistRepo: w}
}

// Create User
func (uc *MovieUsecase) CreateUser(username, email string) (*domain.User, error) {
	existing, err := uc.usersRepo.GetByUsername(username)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("user already exists")
	}
	u := &domain.User{
		Username: username,
		Email:    email,
	}
	if err := uc.usersRepo.Create(u); err != nil {
		return nil, err
	}
	return u, nil
}

// AddMovie with unique title check
func (s *MovieUsecase) AddMovie(m *domain.Movie) (*domain.Movie, error) {
	exist, err := s.moviesRepo.GetMovieByTitle(m.Title)
	if err != nil {
		return nil, err
	}
	if exist != nil {
		return nil, errors.New("movie title already exists")
	}
	if err := s.moviesRepo.CreateMovie(m); err != nil {
		return nil, err
	}
	return m, nil
}

// Watchlist operations
func (s *MovieUsecase) AddToWatchlist(userID, movieID uint) error {
	item := &domain.WatchlistItem{UserID: userID, MovieID: movieID}
	return s.watchlistRepo.AddWatchlist(item)
}
func (s *MovieUsecase) RemoveFromWatchlist(userID, movieID uint) error {
	return s.watchlistRepo.RemoveWatchlist(userID, movieID)
}
func (s *MovieUsecase) GetWatchlist(userID uint) ([]domain.Movie, error) {
	return s.watchlistRepo.ListWatchlistByUser(userID)
}
