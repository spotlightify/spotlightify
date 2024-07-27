package albumOnline

import (
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/searchOnline"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"
)

func RegisterAlbumOnlineCommand(commandManager *command.Manager, spotifyHolder *spot.SpotifyClientHolder) {
	playOnlineCommand := model.Command{
		ID:          "album",
		Name:        "Album",
		Description: "Play an Album",
		Icon:        constants.GetIconAddress(constants.IconAlbum),
		TriggerWord: "album",
		Properties: model.CommandProperties{
			DebounceMS:      500,
			Title:           "Album",
			ShorthandTitle:  "🎶",
			PlaceholderText: "Album search",
			KeepPromptOpen:  false,
		},
		Parameters: map[string]string{},
		PromptText: "",
	}
	searchOnline.RegisterSearchCommand(playOnlineCommand, spotify.SearchTypeAlbum, commandManager, spotifyHolder)
}
