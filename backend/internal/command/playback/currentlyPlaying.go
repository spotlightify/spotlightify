package playback

import (
	"context"
	"fmt"
	"log/slog"
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	"spotlightify-wails/backend/internal/templates"

	spot "spotlightify-wails/backend/internal/spotify"

	"golang.design/x/clipboard"

	"github.com/zmb3/spotify/v2"
)

var currentlyPlayingModel = model.Command{
	ID:          "currently_playing",
	Name:        "Currently Playing",
	Description: "Show currently playing track",
	Icon:        constants.GetIconAddress(constants.IconPlay),
	TriggerWord: "currently playing",
	Properties: model.CommandProperties{
		DebounceMS:      0,
		Title:           "Playing",
		ShorthandTitle:  "🎵",
		PlaceholderText: "Currently playing track",
	},
}

type spotifyPlayer interface {
	CurrentlyPlaying(ctx context.Context) (*spotify.CurrentlyPlaying, error)
}

type currentlyPlayingCommand struct {
	command       model.Command
	spotifyPlayer spotifyPlayer
}

func (d *currentlyPlayingCommand) GetSuggestions(input string, parameters map[string]string, ctx context.Context) model.SuggestionList {
	slb := builders.NewSuggestionListBuilder()

	currentlyPlaying, err := d.spotifyPlayer.CurrentlyPlaying(ctx)
	if err != nil {
		slog.Error(fmt.Sprintf("Error getting currently playing track: %v", err))
		return *slb.AddSuggestion(
			templates.ErrorSuggestion("Error getting currently playing track", err.Error()),
		).Build()
	}

	if currentlyPlaying == nil || currentlyPlaying.Item == nil {
		return *slb.AddSuggestion(
			model.Suggestion{
				Title: "No track is currently playing",
				Icon:  constants.GetIconAddress(constants.IconPlay),
			},
		).Build()
	}

	icon := constants.GetIconAddress(constants.IconPlay)
	if len(currentlyPlaying.Item.Album.Images) >= 3 {
		icon = currentlyPlaying.Item.Album.Images[2].URL
	}

	slb.AddSuggestion(
		model.Suggestion{
			Title:       currentlyPlaying.Item.Name,
			Description: currentlyPlaying.Item.Artists[0].Name,
			Icon:        icon,
			ID:          "currently-playing-track",
			Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
				SetCommand: &model.Command{
					ID:         currentlyPlayingModel.ID,
					Properties: currentlyPlayingModel.Properties,
				},
			}).Build(),
		},
	)

	shareText := "Share"
	if parameters["shared"] == "true" {
		shareText += " - Copied to Clipboard!"
	}

	slb.AddSuggestion(
		model.Suggestion{
			Title:       shareText,
			Description: "Copy the current track's URL to the clipboard",
			Icon:        constants.GetIconAddress(constants.IconShare),
			ID:          "share-currently-playing-track",
			Action: &model.Action{
				ExecuteAction: &model.ExecuteAction{
					CommandId: d.command.ID,
					ExecutionParameters: map[string]string{
						"TrackURL": currentlyPlaying.Item.ExternalURLs["spotify"],
					},
				},
			},
		},
	)

	return *slb.WithStatic().Build()
}

func (d *currentlyPlayingCommand) GetPlaceholderSuggestion() model.Suggestion {
	return model.Suggestion{
		Title:       d.command.Name,
		Description: d.command.Description,
		Icon:        constants.GetIconAddress(constants.IconPlay),
		ID:          "currently-playing-track",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCommand: &model.Command{
				ID:         currentlyPlayingModel.ID,
				Properties: currentlyPlayingModel.Properties,
			},
		}).Build(),
	}
}

func (d *currentlyPlayingCommand) Execute(parameters map[string]string, ctx context.Context) model.ExecuteActionOutput {
	trackURL := parameters["TrackURL"]
	if trackURL == "" {
		slog.Error("No track URL provided")
		return model.ExecuteActionOutput{}
	}

	err := clipboard.Init()
	if err != nil {
		return model.ExecuteActionOutput{
			Suggestions: builders.NewSuggestionListBuilder().AddSuggestion(
				templates.ErrorSuggestion("Error copying to clipboard", err.Error()),
			).Build(),
		}
	}
	clipboard.Write(clipboard.FmtText, []byte(trackURL))
	return model.ExecuteActionOutput{
		Action: &model.Action{
			CommandOptions: &model.CommandOptions{
				SetCurrentCommandParameters: map[string]string{"shared": "true"},
			},
		},
	}
}

type spotifyCurrentlyPlayingBridge struct {
	holder *spot.SpotifyClientHolder
}

func (s *spotifyCurrentlyPlayingBridge) CurrentlyPlaying(ctx context.Context) (*spotify.CurrentlyPlaying, error) {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return nil, fmt.Errorf("spotify API error: %v", err)
	}

	return client.PlayerCurrentlyPlaying(ctx)
}

func RegisterCurrentlyPlayingCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder) {
	player := &spotifyCurrentlyPlayingBridge{holder: spotifyHolder}

	currentlyPlayingCommand := &currentlyPlayingCommand{command: currentlyPlayingModel, spotifyPlayer: player}
	commandRegistry.Register(currentlyPlayingModel.ID, currentlyPlayingModel.TriggerWord, currentlyPlayingCommand)
}
