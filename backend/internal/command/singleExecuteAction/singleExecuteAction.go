package singleExecuteAction

import (
	"context"
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/model"
)

type executeActionCommand struct {
	command               model.Command
	executeActionCallback func() model.ExecuteActionOutput
}

func (d *executeActionCommand) GetSuggestions(input string, parameters map[string]string, ctx context.Context) model.SuggestionList {
	slb := builders.NewSuggestionListBuilder()
	return *slb.Build()
}

func (d *executeActionCommand) GetPlaceholderSuggestion() model.Suggestion {
	return model.Suggestion{
		Title:       d.command.Name,
		Description: d.command.Description,
		Icon:        d.command.Icon,
		ID:          string(d.command.ID),
		Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
			CommandId: d.command.ID,
		}).WithPromptState(
			&model.PromptState{
				ClosePrompt: true,
			},
		).Build(),
	}
}

func (d *executeActionCommand) Execute(parameters map[string]string, ctx context.Context) model.ExecuteActionOutput {
	return d.executeActionCallback()
}

func CreateSingleExecuteActionCommand(command model.Command, executeCallback func() model.ExecuteActionOutput) *executeActionCommand {
	return &executeActionCommand{
		command:               command,
		executeActionCallback: executeCallback,
	}
}
