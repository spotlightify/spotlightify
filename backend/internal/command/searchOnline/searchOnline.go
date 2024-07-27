package searchOnline

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/constants"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/zmb3/spotify/v2"

	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/model"
)

const PlayTypeKey = "playType"

type spotifyPlayer interface {
	Play(ctx context.Context, itemURI string) error
	Queue(ctx context.Context, trackID string) error
	Search(ctx context.Context, query string, searchType spotify.SearchType) (*spotify.SearchResult, error)
}

type searchOnlineCommand struct {
	command       model.Command
	spotifyPlayer spotifyPlayer
	searchType    spotify.SearchType
}

func (c *searchOnlineCommand) GetPlaceholderSuggestion() model.Suggestion {
	return model.Suggestion{
		Title:       c.command.Name,
		Description: c.command.Description,
		Icon:        c.command.Icon,
		ID:          c.command.ID,
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCommand: &c.command,
		}).Build(),
	}
}

func (c *searchOnlineCommand) GetSuggestions(input string, parameters map[string]string, ctx context.Context) model.SuggestionList {
	slb := builders.NewSuggestionListBuilder()

	if input == "" {
		return *slb.Build()
	}

	slog.Debug("Spotify search", "CommandID", c.searchType, "Query", input)

	result, err := c.spotifyPlayer.Search(ctx, input, c.searchType)
	if err != nil {
		slog.Error(fmt.Sprintf("An error occurred while searching for %v with query %s: %v", c.searchType, input, err))
		return *slb.AddSuggestion(
			model.Suggestion{
				Title:       "An error occurred",
				Description: "Please try again",
				Icon:        constants.GetIconAddress(constants.IconError),
				ID:          "play-errorCmd",
				Action:      nil,
			},
		).Build()
	}

	switch c.searchType {
	case spotify.SearchTypeTrack:
		GetSuggestionsForTracks(result, slb, c.command.ID, parameters[PlayTypeKey] == "queue")
	case spotify.SearchTypeAlbum:
		GetSuggestionsForAlbums(result, slb, c.command.ID)
	case spotify.SearchTypeArtist:
		GetSuggestionsForArtists(result, slb, c.command.ID)
	case spotify.SearchTypePlaylist:
		GetSuggestionsForPlaylists(result, slb, c.command.ID)
	case spotify.SearchTypeShow:
		GetSuggestionsForShows(result, slb, c.command.ID)
	case spotify.SearchTypeEpisode:
		GetSuggestionsForEpisodes(result, slb, c.command.ID)
	default:
		log.Println("Search type not supported")
	}

	return *slb.Build()
}

func (c *searchOnlineCommand) spotifyPlay(ctx context.Context, slb *builders.SuggestionListBuilder, spotifyURI string) model.ExecuteActionOutput {
	err := c.spotifyPlayer.Play(ctx, spotifyURI)
	if err != nil {
		slog.Error(fmt.Sprintf("Error playing item: %v", err))
		return model.ExecuteActionOutput{
			Suggestions: slb.AddSuggestion(model.Suggestion{
				Title:       "Error playing track",
				Description: err.Error(),
				Icon:        constants.GetIconAddress(constants.IconError),
				ID:          "play-execute-error",
			}).WithError().Build(),
		}
	}

	return model.ExecuteActionOutput{}
}

func (c *searchOnlineCommand) spotifyQueue(ctx context.Context, slb *builders.SuggestionListBuilder, spotifyURI string) model.ExecuteActionOutput {
	err := c.spotifyPlayer.Queue(ctx, spotifyURI)
	if err != nil {
		slog.Error(fmt.Sprintf("Error queuing item: %v", err))
		return model.ExecuteActionOutput{
			Suggestions: slb.AddSuggestion(model.Suggestion{
				Title:       "Error queuing item",
				Description: err.Error(),
				Icon:        constants.GetIconAddress(constants.IconError),
				ID:          "play-execute-error",
			}).WithError().Build(),
		}
	}

	return model.ExecuteActionOutput{}
}

func (c *searchOnlineCommand) Execute(parameters map[string]string, ctx context.Context) model.ExecuteActionOutput {
	spotifyURI := parameters["spotifyURI"]
	slb := builders.NewSuggestionListBuilder()

	if spotifyURI == "" {
		slog.Error(fmt.Sprintf("Error playing track: %v", "No Spotify URI provided"))
		return model.ExecuteActionOutput{
			Suggestions: slb.AddSuggestion(model.Suggestion{
				Title:       "Error playing track",
				Description: "Please try again",
				Icon:        "errorCmd",
				ID:          "play-execute-errorCmd",
			}).WithError().Build(),
		}
	}

	if parameters[PlayTypeKey] == "queue" {
		spotifyID := parameters["spotifyID"]
		if spotifyID == "" {
			slog.Error("Error queuing item: No track id provided for queuing item", "CommandID", c.command.Properties.Title, "SpotifyURI", spotifyURI)
			return model.ExecuteActionOutput{
				Suggestions: slb.AddSuggestion(model.Suggestion{
					Title:       "Error queuing item",
					Description: "No Spotify track ID provided for queuing",
					Icon:        constants.GetIconAddress(constants.IconError),
					ID:          "play-execute-error",
				}).WithError().Build(),
			}
		}
		slog.Info("Queuing item", "CommandID", c.command.ID, "SpotifyURI", spotifyURI)
		return c.spotifyQueue(ctx, slb, spotifyID)
	}

	slog.Info("Playing item", "CommandID", c.command.ID, "SpotifyURI", spotifyURI)
	return c.spotifyPlay(ctx, slb, spotifyURI)
}

type spotifyPlayBridge struct {
	holder     *spot.SpotifyClientHolder
	searchType spotify.SearchType
}

func (s *spotifyPlayBridge) Search(ctx context.Context, query string, searchType spotify.SearchType) (*spotify.SearchResult, error) {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return nil, fmt.Errorf("spotify search error: %s", err)
	}

	return client.Search(ctx, query, searchType)
}

func (s *spotifyPlayBridge) Play(ctx context.Context, itemURI string) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return fmt.Errorf("spotify play error: %s", err)
	}

	opts := &spotify.PlayOptions{}
	if s.searchType == spotify.SearchTypeAlbum || s.searchType == spotify.SearchTypePlaylist {
		uri := spotify.URI(itemURI)
		opts.PlaybackContext = &uri
	} else {
		opts.URIs = []spotify.URI{spotify.URI(itemURI)}
	}

	return client.PlayOpt(ctx, opts)
}

func (s *spotifyPlayBridge) Queue(ctx context.Context, trackID string) error {
	client, err := s.holder.GetSpotifyInstance()
	if err != nil {
		return fmt.Errorf("spotify play error: %s", err)
	}

	return client.QueueSong(ctx, spotify.ID(trackID))
}

func RegisterSearchCommand(command model.Command, searchType spotify.SearchType, commandManager *command.Manager, spotifyHolder *spot.SpotifyClientHolder) {
	player := &spotifyPlayBridge{holder: spotifyHolder, searchType: searchType}

	searchOnlineCommand := &searchOnlineCommand{spotifyPlayer: player, command: command, searchType: searchType}
	commandManager.RegisterCommandKeyword(command.TriggerWord, searchOnlineCommand)
	commandManager.RegisterCommand(command.ID, searchOnlineCommand)
}
