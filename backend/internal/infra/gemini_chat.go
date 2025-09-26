package infra

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"
)

// GeminiChatService implements a minimal client for Google's Generative Language API
type GeminiChatService struct {
	apiKey string
	model  string
}

func NewGeminiChatServiceFromEnv() (*GeminiChatService, error) {
	key := os.Getenv("GEMINI_API_KEY")
	if key == "" {
		return nil, errors.New("GEMINI_API_KEY not set")
	}
	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-1.5-flash-latest"
	}
	return &GeminiChatService{apiKey: key, model: model}, nil
}

func (s *GeminiChatService) GenerateReply(prompt string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	endpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", s.model, s.apiKey)
	sys := os.Getenv("GEMINI_SYSTEM_PROMPT")
	if sys == "" {
		sys = "You are MovieMate, a super friendly movie buddy! 🎬 When someone says 'hi', respond with excitement like 'Hey there! 🎬 What's your vibe tonight? Looking for something to make you laugh, cry, or jump out of your seat?' Be casual, use emojis, and show personality. Keep responses under 100 words and be specific with movie recommendations (title + year + why it's perfect)."
	}
	reqBody := map[string]interface{}{
		"systemInstruction": map[string]interface{}{
			"role":  "system",
			"parts": []map[string]string{{"text": sys}},
		},
		"contents": []map[string]interface{}{
			{
				"role":  "user",
				"parts": []map[string]string{{"text": prompt}},
			},
		},
	}
	data, _ := json.Marshal(reqBody)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var errBody struct {
			Error any `json:"error"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&errBody)
		return "", fmt.Errorf("gemini error status=%d body=%v", resp.StatusCode, errBody.Error)
	}

	var gr struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&gr); err != nil {
		return "", err
	}
	if len(gr.Candidates) == 0 || len(gr.Candidates[0].Content.Parts) == 0 {
		return "", errors.New("no candidates returned")
	}
	return gr.Candidates[0].Content.Parts[0].Text, nil
}
