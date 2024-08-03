package playOnline

import (
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/searchOnline"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"
)

func RegisterPlayOnlineCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder) {
	playOnlineCommand := model.Command{
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
	searchOnline.RegisterSearchCommand(playOnlineCommand, spotify.SearchTypeTrack, commandRegistry, spotifyHolder)
}
