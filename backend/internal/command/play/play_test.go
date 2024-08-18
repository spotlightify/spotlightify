package play

import (
	"context"
	"testing"

	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/model"
)

func TestPlayCommand_GetTriggerWord(t *testing.T) {
	command := playCommand{}
	expected := "play"
	if triggerWord := command.GetTriggerWord(); triggerWord != expected {
		t.Errorf("Expected trigger word %q, but got %q", expected, triggerWord)
	}
}

func TestPlayCommand_NoPanic(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("Unexpected panic occurred: %v", r)
		}
	}()

	command := playCommand{}
	parameters := map[string]string{
		"spotifyId": "12345",
	}
	ctx := context.Background()

	// Call the methods that could potentially cause a panic
	_ = command.GetTriggerWord()
	_ = command.GetPlaceholderSuggestion()
	_ = command.GetSuggestions("", parameters, ctx)
	_ = command.Execute(parameters, ctx)
}

func TestPlayCommand_GetPlaceholderSuggestion(t *testing.T) {
	command := playCommand{}
	expected := model.Suggestion{
		Title:       "Play",
		Description: "This is a play command",
		Icon:        "play",
		ID:          "play-command",
		Action:      nil,
	}
	if placeholderSuggestion := command.GetPlaceholderSuggestion(); placeholderSuggestion != expected {
		t.Errorf("Expected placeholder suggestion %+v, but got %+v", expected, placeholderSuggestion)
	}
}

// Add more test cases for other methods of the playCommand struct...

func TestPlayCommand_Execute(t *testing.T) {
	command := playCommand{}
	parameters := map[string]string{
		"spotifyId": "12345",
	}
	ctx := context.Background()
	expected := model.ExecuteActionOutput{
		Suggestions: builders.NewSuggestionListBuilder().AddSuggestion(model.Suggestion{
			Title:       "Error playing track",
			Description: "Please try again",
			Icon:        "errorCmd",
			ID:          "play-execute-errorCmd",
		}).WithError().Build(),
	}
	if output := command.Execute(parameters, ctx); output != expected {
		t.Errorf("Expected execute action output %+v, but got %+v", expected, output)
	}
}

// Add more test cases for other methods of the playCommand struct...
