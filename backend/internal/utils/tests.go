package utils

import (
	"testing"

	"spotlightify-wails/backend/internal/model"

	"github.com/stretchr/testify/assert"
)

func ResetParameters(parameters map[string]string) {
	for key := range parameters {
		parameters[key] = ""
	}
}

func AssertSuggestionTitlesAndDescriptions(t *testing.T, suggestions model.SuggestionList, expectedTitles []string, expectedDescriptions []string) {
	assert.Len(t, suggestions.Items, len(expectedTitles))

	for i, suggestion := range suggestions.Items {
		assert.Equal(t, expectedTitles[i], suggestion.Title)
		assert.Equal(t, expectedDescriptions[i], suggestion.Description)
	}
}
