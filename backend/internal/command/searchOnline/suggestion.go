package searchOnline

import (
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	"spotlightify-wails/backend/internal/utils"
	"strings"

	"github.com/zmb3/spotify/v2"
)

func GetSuggestionsForTracks(results *spotify.SearchResult, slb *builders.SuggestionListBuilder, commandID string, addToQueue bool) {
	tracks := results.Tracks.Tracks
	for _, track := range tracks {
		trackArtists := make([]string, len(track.Artists))
		for i, artist := range track.Artists {
			trackArtists[i] = artist.Name
		}

		sb := strings.Builder{}
		utils.NameLineBuilder(&sb, trackArtists)

		executionParameters := map[string]string{"spotifyURI": string(track.URI)}
		if addToQueue {
			executionParameters[PlayTypeKey] = "queue"
			executionParameters["spotifyID"] = string(track.ID)
		}

		slb.AddSuggestion(model.Suggestion{
			Title:       track.Name,
			Description: sb.String(),
			Icon:        track.Album.Images[2].URL,
			ID:          track.ID.String(),
			Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           commandID,
				ExecutionParameters: executionParameters,
			}).WithPromptState(&model.PromptState{
				ClosePrompt: true,
			}).Build(),
		})
	}
}

func GetSuggestionsForAlbums(results *spotify.SearchResult, slb *builders.SuggestionListBuilder, commandID string) {
	albums := results.Albums.Albums
	for _, album := range albums {
		aristNames := make([]string, len(album.Artists))

		for i, artist := range album.Artists {
			aristNames[i] = artist.Name
		}

		sb := strings.Builder{}
		utils.NameLineBuilder(&sb, aristNames)

		slb.AddSuggestion(model.Suggestion{
			Title:       album.Name,
			Description: sb.String(),
			Icon:        album.Images[2].URL,
			ID:          album.ID.String(),
			Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           commandID,
				ExecutionParameters: map[string]string{"spotifyURI": string(album.URI)},
			}).WithPromptState(&model.PromptState{
				ClosePrompt: true,
			}).Build(),
		})
	}
}

func GetSuggestionsForArtists(results *spotify.SearchResult, slb *builders.SuggestionListBuilder, commandID string) {
	artists := results.Artists.Artists
	for _, artist := range artists {
		slb.AddSuggestion(model.Suggestion{
			Title:       artist.Name,
			Description: artist.Genres[0],
			Icon:        constants.GetIconAddress(constants.IconArtist),
			ID:          artist.ID.String(),
			Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           commandID,
				ExecutionParameters: map[string]string{"spotifyURI": artist.ID.String()},
			}).WithPromptState(&model.PromptState{
				ClosePrompt: true,
			}).Build(),
		})
	}
}

func GetSuggestionsForPlaylists(results *spotify.SearchResult, slb *builders.SuggestionListBuilder, commandID string) {
	playlists := results.Playlists.Playlists
	for _, playlist := range playlists {
		icon := constants.GetIconAddress(constants.IconPlaylist)
		if len(playlist.Images) != 0 {
			icon = playlist.Images[0].URL
		}

		slb.AddSuggestion(model.Suggestion{
			Title:       playlist.Name,
			Description: playlist.Owner.DisplayName,
			Icon:        icon,
			ID:          playlist.ID.String(),
			Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           commandID,
				ExecutionParameters: map[string]string{"spotifyURI": string(playlist.URI)},
			}).WithPromptState(&model.PromptState{
				ClosePrompt: true,
			}).Build(),
		})
	}
}

func GetSuggestionsForShows(results *spotify.SearchResult, slb *builders.SuggestionListBuilder, commandID string) {
	shows := results.Shows.Shows
	for _, show := range shows {
		slb.AddSuggestion(model.Suggestion{
			Title:       show.Name,
			Description: show.Description,
			Icon:        show.Images[2].URL,
			ID:          show.ID.String(),
			Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           commandID,
				ExecutionParameters: map[string]string{"spotifyURI": string(show.URI)},
			}).WithPromptState(&model.PromptState{
				ClosePrompt: true,
			}).Build(),
		})
	}
}

func GetSuggestionsForEpisodes(results *spotify.SearchResult, slb *builders.SuggestionListBuilder, commandID string) {
	episodes := results.Episodes.Episodes
	for _, episode := range episodes {
		slb.AddSuggestion(model.Suggestion{
			Title:       episode.Name,
			Description: episode.ReleaseDate,
			Icon:        episode.Images[2].URL,
			ID:          episode.ID.String(),
			Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
				CommandId:           commandID,
				ExecutionParameters: map[string]string{"spotifyURI": string(episode.URI)},
			}).WithPromptState(&model.PromptState{
				ClosePrompt: true,
			}).Build(),
		})
	}
}
