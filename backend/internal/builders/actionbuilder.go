package builders

import "github.com/spotlightify/spotlightify/internal/model"

type ActionBuilder struct {
	action *model.Action
}

func NewActionBuilder() *ActionBuilder {
	return &ActionBuilder{action: &model.Action{}}
}

func (b *ActionBuilder) WithCommandOptions(options *model.CommandOptions) *ActionBuilder {
	b.action.CommandOptions = options
	return b
}

func (b *ActionBuilder) WithPromptState(promptState *model.PromptState) *ActionBuilder {
	b.action.PromptState = promptState
	return b
}

func (b *ActionBuilder) WithExecuteAction(executeAction *model.ExecuteAction) *ActionBuilder {
	b.action.ExecuteAction = executeAction
	return b
}

func (b *ActionBuilder) Build() *model.Action {
	return b.action
}
