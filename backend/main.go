package main

import (
	"log"
	"os"

	delivery "github.com/HMZ-H/moviemate/internal/delivery"
	"github.com/HMZ-H/moviemate/internal/infra"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env if present (ignore error if missing)
	_ = godotenv.Load()
	// Initialize DB if DATABASE_URL is set (optional for chatbot)
	if os.Getenv("DATABASE_URL") != "" {
		if _, err := infra.NewDB(); err != nil {
			log.Printf("DB init error: %v", err)
		}
	}
	r := delivery.SetupRouter()

	// Allow CORS for Vite dev server
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
