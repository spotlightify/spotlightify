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

var previousTrackModel = model.Command{
	ID:          "previous_track",
	Name:        "Previous",
	Description: "Play the previous track",
	Icon:        constants.GetIconAddress(constants.IconBackward),
	TriggerWord: "previous",
	Properties:  model.CommandProperties{},
}

type spotifyPreviousTrack interface {
	PreviousTrack(ctx context.Context) error
}

type spotifyPreviousTrackBridge struct {
	holder *spot.SpotifyClientHolder
}

func (s *spotifyPreviousTrackBridge) PreviousTrack(ctx context.Context) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return fmt.Errorf("spotify API error: %v", err)
	}

	return client.Previous(ctx)
}

func createPreviousTrackCallback(player spotifyPreviousTrack) func() model.ExecuteActionOutput {
	return func() model.ExecuteActionOutput {
		slb := builders.NewSuggestionListBuilder()
		err := player.PreviousTrack(context.Background())
		if err != nil {
			return model.ExecuteActionOutput{
				Suggestions: slb.AddSuggestion(
					templates.ErrorSuggestion("Error getting previous track", err.Error()),
				).Build(),
			}
		}

		return model.ExecuteActionOutput{}
	}
}

func RegisterPreviousTrackCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder) {
	player := &spotifyPreviousTrackBridge{holder: spotifyHolder}

	nextTrackCommand := singleExecuteAction.CreateSingleExecuteActionCommand(previousTrackModel, createPreviousTrackCallback(player))
	commandRegistry.Register(previousTrackModel.ID, previousTrackModel.TriggerWord, nextTrackCommand)
}
