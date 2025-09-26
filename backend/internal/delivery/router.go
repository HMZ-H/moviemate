package delivery

import (
	"fmt"

	"time"

	deliveryhttp "github.com/HMZ-H/moviemate/internal/delivery/http"
	"github.com/HMZ-H/moviemate/internal/infra"
	"github.com/HMZ-H/moviemate/internal/repository"
	tollbooth "github.com/didip/tollbooth/v7"
	tollbooth_gin "github.com/didip/tollbooth_gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures the HTTP routes
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		"http://localhost:5173", 
		"http://localhost:5174",
		"https://moviemate-frontend.onrender.com", // Add your deployed frontend URL
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// Initialize database and repository
	db, err := infra.NewDB()
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}
	userRepo := repository.NewGormRepo(db)
	watchlistRepo := repository.NewGormRepo(db)
	authHandler := deliveryhttp.NewAuthHandler(userRepo)
	watchlistHandler := deliveryhttp.NewWatchlistHandler(watchlistRepo)

	// Authentication routes (public)
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(authHandler.AuthMiddleware())
	{
		protected.GET("/profile", authHandler.GetProfile)
		protected.POST("/watchlist", watchlistHandler.AddToWatchlist)
		protected.DELETE("/watchlist", watchlistHandler.RemoveFromWatchlist)
		protected.GET("/watchlist", watchlistHandler.GetWatchlist)
	}

	// Rate limiter for chat endpoint: 1 req/sec per client
	limiter := tollbooth.NewLimiter(1, nil)
	limiter.SetTokenBucketExpirationTTL(time.Minute)
	limiter.SetIPLookups([]string{"X-Forwarded-For", "X-Real-IP", "RemoteAddr"})

	// Use Gemini when configured; otherwise fall back to simple service
	if gemini, err := infra.NewGeminiChatServiceFromEnv(); err == nil {
		chatHandler := deliveryhttp.NewChatHandler(gemini)
		api := r.Group("/api")
		{
			api.POST("/chat", tollbooth_gin.LimitHandler(limiter), chatHandler.HandleChat)
		}
		r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok", "provider": "gemini"}) })
		return r
	}

	// fallback to simple service if neither configured
	chatHandler := deliveryhttp.NewChatHandler(infra.NewSimpleChatService())
	api := r.Group("/api")
	{
		api.POST("/chat", tollbooth_gin.LimitHandler(limiter), chatHandler.HandleChat)
	}
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok", "provider": "simple"}) })

	return r
}
