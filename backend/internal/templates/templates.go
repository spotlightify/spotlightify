package templates

import (
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
)

func ClearPromptAndCommandsAction() *model.Action {
	return builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
		ClearCommandStack: true,
	}).WithPromptState(&model.PromptState{ClosePrompt: true}).Build()
}

func ErrorSuggestion(title string, description string) model.Suggestion {
	return model.Suggestion{
		Title:       title,
		Description: description,
		Icon:        constants.GetIconAddress(constants.IconError),
	}
}
