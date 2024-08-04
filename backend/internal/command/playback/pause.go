package playback

import (
	"context"
	"fmt"
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/singleExecuteAction"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	"spotlightify-wails/backend/internal/templates"

	spot "spotlightify-wails/backend/internal/spotify"
)

var pauseModel = model.Command{
	ID:          "pause",
	Name:        "Pause",
	Description: "Pause the current track on Spotify",
	Icon:        constants.GetIconAddress(constants.IconPause),
	TriggerWord: "pause",
	Properties:  model.CommandProperties{},
}

type spotifyPauseTrack interface {
	Pause(ctx context.Context) error
}

type spotifyPauseBridge struct {
	holder *spot.SpotifyClientHolder
}

func (s *spotifyPauseBridge) Pause(ctx context.Context) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return fmt.Errorf("spotify API error: %v", err)
	}

	return client.Pause(ctx)
}

func createPauseCallback(player spotifyPauseTrack) func() model.ExecuteActionOutput {
	return func() model.ExecuteActionOutput {
		slb := builders.NewSuggestionListBuilder()
		err := player.Pause(context.Background())
		if err != nil {
			return model.ExecuteActionOutput{
				Suggestions: slb.AddSuggestion(
					templates.ErrorSuggestion("Error pausing the track", err.Error()),
				).Build(),
			}
		}

		return model.ExecuteActionOutput{}
	}
}

func RegisterPauseCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder) {
	player := &spotifyPauseBridge{holder: spotifyHolder}

	pauseCommand := singleExecuteAction.CreateSingleExecuteActionCommand(pauseModel, createPauseCallback(player))
	commandRegistry.Register(pauseModel.ID, pauseModel.TriggerWord, pauseCommand)
}
