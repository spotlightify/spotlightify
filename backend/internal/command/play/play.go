package play

import (
	"context"
	"fmt"
	"log"

	"github.com/spotlightify/spotlightify/internal/command"
	"github.com/spotlightify/spotlightify/internal/spotify"

	"github.com/spotlightify/spotlightify/internal/builders"
	"github.com/spotlightify/spotlightify/internal/cache"
	"github.com/spotlightify/spotlightify/internal/model"
)

const playCommandId = "play"

var commandProperties = model.CommandProperties{
	ID:                   "play",
	DebounceMS:           0,
	Title:                "Play",
	ShorthandTitle:       "▶",
	ShorthandPersistOnUI: true,
}

type spotifyPlayer interface {
	Play(ctx context.Context) error
}

type cachedTrackGetter interface {
	GetTrack(key string) ([]model.Track, error)
}

type playCommand struct {
	model.CommandProperties
	spotifyPlayer spotifyPlayer
	cacheGetter   cachedTrackGetter
}

func (c playCommand) GetTriggerWord() string {
	return "play"
}

func (c playCommand) GetPlaceholderSuggestion() model.Suggestion {
	return model.Suggestion{
		Title:       "Play",
		Description: "This is a play command",
		Icon:        "play",
		ID:          "play-command",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCommand: &model.SetCommand{
				Id:         playCommandId,
				Properties: commandProperties,
			},
		}).Build(),
	}
}

func (c playCommand) GetSuggestions(input string, parameters map[string]string, ctx context.Context) *model.SuggestionList {
	slb := builders.CreateSuggestionListBuilder()

	tracks, err := c.cacheGetter.GetTrack(input)
	if err != nil {
		return slb.AddSuggestion(
			model.Suggestion{
				Title:       "An errorCmd occurred",
				Description: "Please try again",
				Icon:        "errorCmd",
				ID:          "play-errorCmd",
				Action:      nil,
			},
		).Build()
	}

	slb.AddSuggestion(
		model.Suggestion{
			Title:       fmt.Sprintf("Search online for '%s'", input),
			Description: "Search Spotify for a track ",
			Icon:        "play",
			ID:          "play-command",
			Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
				PushCommand: &model.PushCommand{
					Id:         playCommandId,
					Properties: onlineCommandModel,
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
			Icon:        "play",
			ID:          track.SpotifyID,
			Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           playCommandId,
				ExecutionParameters: params,
				WaitTillComplete:    false,
				CloseOnSuccess:      false,
			}).Build(),
		})
	}

	return slb.Build()
}

func (c playCommand) Execute(parameters map[string]string, ctx context.Context) *model.ExecuteActionOutput {
	spotifyTrackId := parameters["spotifyId"]

	if spotifyTrackId == "" {
		log.Println("Failed to play track")
		return &model.ExecuteActionOutput{
			Suggestions: builders.CreateSuggestionListBuilder().AddSuggestion(model.Suggestion{
				Title:       "Error playing track",
				Description: "Please try again",
				Icon:        "errorCmd",
				ID:          "play-execute-errorCmd",
			}).WithError().Build(),
		}
	}

	return nil
}

type spotifyPlayBridge struct {
	holder *spotify.SpotifyClientHolder
}

func (s *spotifyPlayBridge) Play(ctx context.Context) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return err
	}

	return client.Play(ctx)
}

func RegisterPlayCommand(commandManager *command.Manager, spotifyHolder *spotify.SpotifyClientHolder, cacheManager *cache.CacheManager) {
	player := &spotifyPlayBridge{holder: spotifyHolder}

	playCommand := playCommand{spotifyPlayer: player, cacheGetter: cacheManager}
	commandManager.RegisterCommandKeyword("play", playCommand)
	commandManager.RegisterCommand(playCommandId, playCommand)
}
