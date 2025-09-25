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
		// Debug mode: expose exact error for troubleshooting
		if os.Getenv("CHAT_DEBUG") == "1" || os.Getenv("CHAT_DEBUG") == "true" {
			c.JSON(stdhttp.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		// Graceful fallback: provide a simple reply instead of 500
		c.JSON(stdhttp.StatusOK, ChatResponse{Reply: "Tell me what kind of movies you like, and I'll suggest some!"})
		return
	}
	c.JSON(stdhttp.StatusOK, ChatResponse{Reply: reply})
}
