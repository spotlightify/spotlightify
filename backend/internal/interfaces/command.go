package interfaces

import (
	"context"

	"spotlightify-wails/backend/internal/model"
)

type Command interface {
	GetSuggestions(input string, parameters map[string]string, ctx context.Context) model.SuggestionList // Get suggestions for the command, based on the input and parameters provided
	GetPlaceholderSuggestion() model.Suggestion                                                          // Placeholder suggestion for the command
	Execute(parameters map[string]string, ctx context.Context) model.ExecuteActionOutput                 // Execute the command, output is an action
}
