package play

import (
	"github.com/spotlightify/spotlightify/internal/model"
)

var onlineCommandModel = model.CommandProperties{
	Title:                "Find Online",
	ShorthandTitle:       "🌐",
	ShorthandPersistOnUI: true,
	DebounceMS:           300,
}

type onlineCommand struct {
	model.CommandProperties
}

func (c onlineCommand) Execute(parameters map[string]string) (*model.Action, []model.Suggestion) {
	//TODO implement me
	panic("implement me")
}

func (c onlineCommand) GetError(errorId string, errorMsg string) ([]model.Suggestion, []model.Suggestion) {
	//TODO implement me
	panic("implement me")
}

func (c onlineCommand) GetProperties() model.CommandProperties {
	//TODO implement me
	panic("implement me")
}

func (c onlineCommand) GetSuggestions(input string, parameters map[string]string) *model.SuggestionList {
	//TODO implement me
	panic("implement me")
}

func (c onlineCommand) GetPlaceholderSuggestion() model.Suggestion {
	return model.Suggestion{}
}

func newOnlineCommand() onlineCommand {
	return onlineCommand{
		onlineCommandModel,
	}
}
