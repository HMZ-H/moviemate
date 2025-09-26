package deliveryhttp

import (
	"log"
	stdhttp "net/http"
	"os"

	"github.com/HMZ-H/moviemate/internal/domain"
	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Reply string `json:"reply"`
}

type ChatHandler struct {
	chatSvc domain.ChatService
}

func NewChatHandler(chatSvc domain.ChatService) *ChatHandler {
	return &ChatHandler{chatSvc: chatSvc}
}

func (h *ChatHandler) HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil || len(req.Message) == 0 {
		c.JSON(stdhttp.StatusBadRequest, gin.H{"error": "message is required"})
		return
	}
	reply, err := h.chatSvc.GenerateReply(req.Message)
	if err != nil {
		log.Printf("chat generate error: %v", err)
		// Always return the error in development, but provide a better fallback in production
		if os.Getenv("CHAT_DEBUG") == "1" || os.Getenv("CHAT_DEBUG") == "true" {
			c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		// Better fallback message that's more engaging
		c.JSON(stdhttp.StatusOK, ChatResponse{Reply: "Hey there! 🎬 I'm having a small technical hiccup, but I'm still here to help! What kind of movies are you in the mood for? Action? Comedy? Romance? Just tell me what you're feeling!"})
		return
	}
	c.JSON(stdhttp.StatusOK, ChatResponse{Reply: reply})
}
