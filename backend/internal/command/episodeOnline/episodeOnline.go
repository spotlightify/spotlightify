package episodeOnline

import (
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/searchOnline"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"
)

func RegisterEpisodeOnlineCommand(commandRegistry *command.Registry, spotifyHolder *spot.SpotifyClientHolder) {
	episodeOnlineCommand := model.Command{
		ID:          "episode",
		Name:        "Episode",
		Description: "Play an episode of a podcast",
		Icon:        constants.GetIconAddress(constants.IconPodcast),
		TriggerWord: "episode",
		Properties: model.CommandProperties{
			DebounceMS:      500,
			Title:           "Episode",
			ShorthandTitle:  "▶",
			PlaceholderText: "Podcast episode search",
			KeepPromptOpen:  false,
		},
		Parameters: map[string]string{},
		PromptText: "",
	}
	searchOnline.RegisterSearchCommand(episodeOnlineCommand, spotify.SearchTypeEpisode, commandRegistry, spotifyHolder)
}
