package queueOnline

import (
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/searchOnline"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"
)

func RegisterQueueOnlineCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder) {
	playOnlineCommand := model.Command{
		ID:          "queue",
		Name:        "Queue",
		Description: "Queue a track",
		Icon:        constants.GetIconAddress(constants.IconQueue),
		TriggerWord: "queue",
		Properties: model.CommandProperties{
			DebounceMS:      500,
			Title:           "Queue",
			ShorthandTitle:  "▶",
			PlaceholderText: "Track search to queue",
			KeepPromptOpen:  false,
		},
		Parameters: map[string]string{searchOnline.PlayTypeKey: "queue"},
		PromptText: "",
	}
	searchOnline.RegisterSearchCommand(playOnlineCommand, spotify.SearchTypeTrack, commandRegistry, spotifyHolder)
}
