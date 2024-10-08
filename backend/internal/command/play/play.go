package play

import (
	"context"
	"fmt"
	"log"

	"spotlightify-wails/backend/internal/constants"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"

	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/model"
)

var commandModel = model.Command{
	ID:          "play",
	Name:        "Play",
	Description: "Play a track",
	Icon:        constants.GetIconAddress(constants.IconPlay),
	TriggerWord: "play",
	Properties: model.CommandProperties{
		DebounceMS:      500,
		Title:           "Play",
		ShorthandTitle:  "▶",
		PlaceholderText: "Track search",
		KeepPromptOpen:  false,
	},
	Parameters: map[string]string{},
	PromptText: "",
}

type spotifyPlayer interface {
	Play(ctx context.Context, trackID string) error
}

type cachedTrackGetter interface {
	GetTrack(key string) ([]model.Track, error)
}

type playCommand struct {
	model.CommandProperties
	spotifyPlayer spotifyPlayer
	cacheGetter   cachedTrackGetter
}

func (c *playCommand) GetTriggerWord() string {
	return "play"
}

func (c *playCommand) GetPlaceholderSuggestion() model.Suggestion {
	return model.Suggestion{
		Title:       "Play",
		Description: "This is a play command",
		Icon:        constants.GetIconAddress(constants.IconPlay),
		ID:          "play-command",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCommand: &model.Command{
				ID:         commandModel.ID,
				Properties: commandModel.Properties,
			},
		}).Build(),
	}
}

func (c *playCommand) GetSuggestions(input string, parameters map[string]string, ctx context.Context) model.SuggestionList {
	slb := builders.NewSuggestionListBuilder()

	tracks, err := c.cacheGetter.GetTrack(input)
	if err != nil {
		return *slb.AddSuggestion(
			model.Suggestion{
				Title:       "An errorCmd occurred",
				Description: "Please try again",
				Icon:        constants.GetIconAddress(constants.IconExit),
				ID:          "play-errorCmd",
				Action:      nil,
			},
		).Build()
	}

	slb.AddSuggestion(
		model.Suggestion{
			Title:       fmt.Sprintf("Search online for '%s'", input),
			Description: "Search Spotify for a track ",
			Icon:        constants.GetIconAddress(constants.IconSearch),
			ID:          "play-command",
			Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
				PushCommand: &model.Command{
					ID: commandModel.ID,
				},
			}).Build(),
		},
	)

	for _, track := range tracks {
		params := map[string]string{
			"spotifyId": track.SpotifyID,
		}

		slb.AddSuggestion(model.Suggestion{
			Title:       track.Name,
			Description: track.ArtistNames,
			Icon:        constants.GetIconAddress(constants.IconPlay),
			ID:          track.SpotifyID,
			Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           commandModel.ID,
				ExecutionParameters: params,
				WaitTillComplete:    false,
				CloseOnSuccess:      false,
			}).WithPromptState(&model.PromptState{ClosePrompt: true}).Build(),
		})
	}

	return *slb.Build()
}

func (c *playCommand) Execute(parameters map[string]string, ctx context.Context) model.ExecuteActionOutput {
	spotifyTrackId := parameters["spotifyId"]
	slb := builders.NewSuggestionListBuilder()

	if spotifyTrackId == "" {
		log.Println("Failed to play track")
		return model.ExecuteActionOutput{
			Suggestions: slb.AddSuggestion(model.Suggestion{
				Title:       "Error playing track",
				Description: "Please try again",
				Icon:        "errorCmd",
				ID:          "play-execute-errorCmd",
			}).WithError().Build(),
		}
	}

	err := c.spotifyPlayer.Play(ctx, spotifyTrackId)
	if err != nil {
		log.Println(err)
		return model.ExecuteActionOutput{
			Suggestions: slb.AddSuggestion(model.Suggestion{
				Title:       "Error playing track",
				Description: err.Error(),
				Icon:        "error",
				ID:          "play-execute-error",
			}).WithError().Build(),
		}
	}

	log.Println("Playing track with Spotify ID:", spotifyTrackId)

	return model.ExecuteActionOutput{
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{ClearCommandStack: true}).Build(),
	}
}

type spotifyPlayBridge struct {
	holder *spot.SpotifyClientHolder
}

func (s *spotifyPlayBridge) Play(ctx context.Context, trackID string) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return fmt.Errorf("spotify play error: %w", err)
	}

	uris := []spotify.URI{spotify.URI("spotify:track:" + trackID)}

	return client.PlayOpt(ctx, &spotify.PlayOptions{URIs: uris})
}

// TODO Use this command after local caching is implemented
//func RegisterPlayCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder, cacheManager *cache.CacheManager) {
//	player := &spotifyPlayBridge{holder: spotifyHolder}
//
//	playCommand := &playCommand{spotifyPlayer: player, cacheGetter: cacheManager}
//	commandRegistry.RegisterCommandKeyword("play", playCommand)
//	commandRegistry.RegisterCommand(playCommandId, playCommand)
//}
