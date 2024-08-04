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

var nextTrackModel = model.Command{
	ID:          "next_track",
	Name:        "Next",
	Description: "Play the next track in the queue",
	Icon:        constants.GetIconAddress(constants.IconForward),
	TriggerWord: "next",
	Properties:  model.CommandProperties{},
}

type spotifyNextTrack interface {
	NextTrack(ctx context.Context) error
}

type spotifyNextTrackBridge struct {
	holder *spot.SpotifyClientHolder
}

func (s *spotifyNextTrackBridge) NextTrack(ctx context.Context) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return fmt.Errorf("spotify API error: %v", err)
	}

	return client.Next(ctx)
}

func createNextTrackCallback(player spotifyNextTrack) func() model.ExecuteActionOutput {
	return func() model.ExecuteActionOutput {
		slb := builders.NewSuggestionListBuilder()
		err := player.NextTrack(context.Background())
		if err != nil {
			return model.ExecuteActionOutput{
				Suggestions: slb.AddSuggestion(
					templates.ErrorSuggestion("Error getting next track", err.Error()),
				).Build(),
			}
		}

		return model.ExecuteActionOutput{}
	}
}

func RegisterNextTrackCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder) {
	player := &spotifyNextTrackBridge{holder: spotifyHolder}

	nextTrackCommand := singleExecuteAction.CreateSingleExecuteActionCommand(nextTrackModel, createNextTrackCallback(player))
	commandRegistry.Register(nextTrackModel.ID, nextTrackModel.TriggerWord, nextTrackCommand)
}
