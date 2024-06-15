package play

import (
	"fmt"
	"log"

	"github.com/spotlightify/spotlightify/internal/command"

	"github.com/spotlightify/spotlightify/internal/cache"
	"github.com/spotlightify/spotlightify/internal/model"
	u "github.com/spotlightify/spotlightify/internal/utils"
)

const playCommandId = "play"

var commandProperties = model.CommandProperties{
	ID:                   "play",
	DebounceMS:           0,
	Title:                "Play",
	ShorthandTitle:       "▶",
	ShorthandPersistOnUI: true,
}

type playCommand struct {
	model.CommandProperties
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
		Action: u.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCommand: &model.SetCommand{
				Id:         playCommandId,
				Properties: commandProperties,
			},
		}).Build(),
	}
}

func (c playCommand) GetSuggestions(input string, parameters map[string]string) *model.SuggestionList {
	slb := u.CreateSuggestionListBuilder()

	tracks, err := cache.CacheManager.GetTrack(input)
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
			Action: u.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
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
			Action: u.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           playCommandId,
				ExecutionParameters: params,
				WaitTillComplete:    false,
				CloseOnSuccess:      false,
			}).Build(),
		})
	}

	return slb.Build()
}

func (c playCommand) Execute(parameters map[string]string) *model.ExecuteActionOutput {
	spotifyTrackId := parameters["spotifyId"]

	if spotifyTrackId == "" {
		log.Println("Failed to play track")
		return &model.ExecuteActionOutput{
			Suggestions: u.CreateSuggestionListBuilder().AddSuggestion(model.Suggestion{
				Title:       "Error playing track",
				Description: "Please try again",
				Icon:        "errorCmd",
				ID:          "play-execute-errorCmd",
			}).WithError().Build(),
		}
	}

	return nil
}

func RegisterPlayCommand() {
	playCommand := playCommand{}
	command.GlobalCommandManager.RegisterCommandKeyword("play", playCommand)
	command.GlobalCommandManager.RegisterCommand(playCommandId, playCommand)
}
