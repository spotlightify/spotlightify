package spotify

import (
	"context"
	"spotlightify-wails/backend/configs"

	"github.com/zmb3/spotify/v2"
)

type SpotifyAPIClient struct {
	spotify.Client
	config *configs.SpotlightifyConfig
}

func (s *SpotifyAPIClient) PlaySpotlightify(URIs []spotify.URI) error {
	ctx := context.Background()

	deviceToPlayOn := ""
	if activeDevice := s.config.GetActiveDevice(); activeDevice != "" {
		deviceToPlayOn = activeDevice
	} else if defaultDevice := s.config.GetDefaultDevice(); defaultDevice != "" {
		deviceToPlayOn = defaultDevice
	}

	deviceID := spotify.ID(deviceToPlayOn)
	return s.PlayOpt(ctx, &spotify.PlayOptions{URIs: URIs, DeviceID: &deviceID})
}

func (s *SpotifyAPIClient) QueueSpotlightify(ID spotify.ID) error {
	ctx := context.Background()

	deviceToPlayOn := ""
	if activeDevice := s.config.GetActiveDevice(); activeDevice != "" {
		deviceToPlayOn = activeDevice
	} else if defaultDevice := s.config.GetDefaultDevice(); defaultDevice != "" {
		deviceToPlayOn = defaultDevice
	}

	deviceID := spotify.ID(deviceToPlayOn)
	return s.QueueSongOpt(ctx, ID, &spotify.PlayOptions{DeviceID: &deviceID})
}
