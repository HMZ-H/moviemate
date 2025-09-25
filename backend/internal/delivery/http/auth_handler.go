package deliveryhttp

import (
	"log"
	stdhttp "net/http"

	"github.com/HMZ-H/moviemate/internal/domain"
	"github.com/HMZ-H/moviemate/internal/infra"
	"github.com/HMZ-H/moviemate/internal/repository"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo    repository.UserRepo
	authService *infra.AuthService
}

func NewAuthHandler(userRepo repository.UserRepo) *AuthHandler {
	return &AuthHandler{
		userRepo:    userRepo,
		authService: infra.NewAuthService(),
	}
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token   string       `json:"token"`
	User    *domain.User `json:"user"`
	Message string       `json:"message"`
	Success bool         `json:"success"`
}

type UserResponse struct {
	ID        uint   `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
}

// Register creates a new user account
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(stdhttp.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Check if username already exists
	existingUser, err := h.userRepo.GetByUsername(req.Username)
	if err != nil {
		log.Printf("Error checking username: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if existingUser != nil {
		c.JSON(stdhttp.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// Check if email already exists
	existingEmail, err := h.userRepo.GetByEmail(req.Email)
	if err != nil {
		log.Printf("Error checking email: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if existingEmail != nil {
		c.JSON(stdhttp.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	// Hash password
	hashedPassword, err := h.authService.HashPassword(req.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// Create user
	user := &domain.User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
	}

	if err := h.userRepo.Create(user); err != nil {
		log.Printf("Error creating user: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(stdhttp.StatusCreated, AuthResponse{
		Token:   token,
		User:    user,
		Message: "User registered successfully",
		Success: true,
	})
}

// Login authenticates a user
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(stdhttp.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Get user by username
	user, err := h.userRepo.GetByUsername(req.Username)
	if err != nil {
		log.Printf("Error finding user: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if user == nil {
		c.JSON(stdhttp.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if err := h.authService.CheckPassword(req.Password, user.Password); err != nil {
		c.JSON(stdhttp.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(stdhttp.StatusOK, AuthResponse{
		Token:   token,
		User:    user,
		Message: "Login successful",
		Success: true,
	})
}

// GetProfile returns the current user's profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(stdhttp.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		log.Printf("Error getting user: %v", err)
		c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if user == nil {
		c.JSON(stdhttp.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	userResponse := &UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	c.JSON(stdhttp.StatusOK, gin.H{
		"user":    userResponse,
		"success": true,
	})
}

// AuthMiddleware validates JWT tokens
func (h *AuthHandler) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(stdhttp.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenString := authHeader
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			tokenString = authHeader[7:]
		}

		userID, err := h.authService.GetUserIDFromToken(tokenString)
		if err != nil {
			c.JSON(stdhttp.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}
