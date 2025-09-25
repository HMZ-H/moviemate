package infra

import "github.com/HMZ-H/moviemate/internal/domain"

// simpleChatService is a minimal fallback implementation
// that satisfies domain.ChatService when no AI provider is configured.
type simpleChatService struct{}

func NewSimpleChatService() domain.ChatService {
	return &simpleChatService{}
}

func (s *simpleChatService) GenerateReply(prompt string) (string, error) {
	return "Tell me what kind of movies you like, and I'll suggest some!", nil
}

