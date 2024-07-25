package playlistOnline

import (
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/searchOnline"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"
)

func RegisterPlaylistOnlineCommand(commandManager *command.Manager, spotifyHolder *spot.SpotifyClientHolder) {
	playOnlineCommand := model.Command{
		ID:          "playlist",
		Name:        "Playlist",
		Description: "Play a playlist",
		Icon:        constants.GetIconAddress(constants.IconPlaylist),
		TriggerWord: "playlist",
		Properties: model.CommandProperties{
			DebounceMS:      500,
			Title:           "Playlist",
			ShorthandTitle:  "🎶",
			PlaceholderText: "Playlist search",
			KeepPromptOpen:  false,
		},
		Parameters: map[string]string{},
		PromptText: "",
	}
	searchOnline.RegisterSearchCommand(playOnlineCommand, spotify.SearchTypePlaylist, commandManager, spotifyHolder)
}
