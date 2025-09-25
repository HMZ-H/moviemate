package deliveryhttp

import (
	"log"
	stdhttp "net/http"

	"github.com/HMZ-H/moviemate/internal/domain"
	"github.com/HMZ-H/moviemate/internal/repository"
	"github.com/gin-gonic/gin"
)

type WatchlistRequest struct {
	MovieID int `json:"movie_id" binding:"required"`
}

type WatchlistResponse struct {
	Message string `json:"message"`
	Success bool   `json:"success"`
}

type WatchlistHandler struct {
	watchlistRepo repository.WatchlistRepo
}

func NewWatchlistHandler(watchlistRepo repository.WatchlistRepo) *WatchlistHandler {
	return &WatchlistHandler{watchlistRepo: watchlistRepo}
}

func (h *WatchlistHandler) AddToWatchlist(c *gin.Context) {
	var req WatchlistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(stdhttp.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	log.Printf("Received watchlist request: %+v", req)

	// Get user ID from authenticated context
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(stdhttp.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	userID := userIDInterface.(uint)

	// Create watchlist item
	item := &domain.WatchlistItem{
		UserID:  userID,
		MovieID: uint(req.MovieID),
	}

	if err := h.watchlistRepo.AddWatchlist(item); err != nil {
		log.Printf("Error adding to watchlist: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, WatchlistResponse{
			Message: "Failed to add to watchlist",
			Success: false,
		})
		return
	}

	c.JSON(stdhttp.StatusOK, WatchlistResponse{
		Message: "Added to watchlist successfully",
		Success: true,
	})
}

func (h *WatchlistHandler) RemoveFromWatchlist(c *gin.Context) {
	var req WatchlistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(stdhttp.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Get user ID from authenticated context
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(stdhttp.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	userID := userIDInterface.(uint)

	if err := h.watchlistRepo.RemoveWatchlist(userID, uint(req.MovieID)); err != nil {
		log.Printf("Error removing from watchlist: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, WatchlistResponse{
			Message: "Failed to remove from watchlist",
			Success: false,
		})
		return
	}

	c.JSON(stdhttp.StatusOK, WatchlistResponse{
		Message: "Removed from watchlist successfully",
		Success: true,
	})
}

func (h *WatchlistHandler) GetWatchlist(c *gin.Context) {
	// Get user ID from authenticated context
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(stdhttp.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	userID := userIDInterface.(uint)

	// Return TMDB IDs so frontend can fetch details from TMDB
	ids, err := h.watchlistRepo.ListWatchlistIDsByUser(userID)
	if err != nil {
		log.Printf("Error fetching watchlist IDs: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Failed to fetch watchlist"})
		return
	}

	c.JSON(stdhttp.StatusOK, gin.H{
		"items": ids,
		"count": len(ids),
	})
}
