package podcastOnline

import (
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/searchOnline"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"
)

func RegisterPodcastOnlineCommand(commandManager *command.Manager, spotifyHolder *spot.SpotifyClientHolder) {
	podcastOnlineCommand := model.Command{
		ID:          "podcast",
		Name:        "Podcast",
		Description: "Play a podcast",
		Icon:        constants.GetIconAddress(constants.IconPodcast),
		TriggerWord: "podcast",
		Properties: model.CommandProperties{
			DebounceMS:      500,
			Title:           "Podcast",
			ShorthandTitle:  "▶",
			PlaceholderText: "Podcast search",
			KeepPromptOpen:  false,
		},
		Parameters: map[string]string{},
		PromptText: "",
	}
	searchOnline.RegisterSearchCommand(podcastOnlineCommand, spotify.SearchTypeShow, commandManager, spotifyHolder)
}
