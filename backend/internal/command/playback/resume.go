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

var resumeModel = model.Command{
	ID:          "resume",
	Name:        "Resume",
	Description: "Resume the current track on Spotify",
	Icon:        constants.GetIconAddress(constants.IconPlay),
	TriggerWord: "resume",
	Properties:  model.CommandProperties{},
}

type spotifyResumeTrack interface {
	Resume(ctx context.Context) error
}

type spotifyResumeBridge struct {
	holder *spot.SpotifyClientHolder
}

func (s *spotifyResumeBridge) Resume(ctx context.Context) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return fmt.Errorf("spotify API error: %v", err)
	}

	return client.Play(ctx)
}

func createResumeCallback(player spotifyResumeTrack) func() model.ExecuteActionOutput {
	return func() model.ExecuteActionOutput {
		slb := builders.NewSuggestionListBuilder()
		err := player.Resume(context.Background())
		if err != nil {
			return model.ExecuteActionOutput{
				Suggestions: slb.AddSuggestion(
					templates.ErrorSuggestion("Error getting currently playing track", err.Error()),
				).Build(),
			}
		}

		return model.ExecuteActionOutput{}
	}
}

func RegisterResumeCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder) {
	player := &spotifyResumeBridge{holder: spotifyHolder}

	nextTrackCommand := singleExecuteAction.CreateSingleExecuteActionCommand(resumeModel, createResumeCallback(player))
	commandRegistry.Register(resumeModel.ID, resumeModel.TriggerWord, nextTrackCommand)
}
