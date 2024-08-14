package backend

import (
	"context"
	"fmt"
	"log/slog"
	"spotlightify-wails/backend/internal/constants"

	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (b *Backend) GetTracksByQuery(query string) ([]spotify.SimpleTrack, error) {
	ctx := context.Background()
	spotifyPlayer, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.SimpleTrack{}, err
	}

	results, err := spotifyPlayer.Search(ctx, query, spotify.SearchTypeTrack)
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.SimpleTrack{}, err
	}

	simpleTracks := make([]spotify.SimpleTrack, len(results.Tracks.Tracks))
	for i, track := range results.Tracks.Tracks {
		track.SimpleTrack.Album = track.Album
		simpleTracks[i] = track.SimpleTrack
	}

	return simpleTracks, nil
}

func (b *Backend) GetPlaylistsByQuery(query string) ([]spotify.SimplePlaylist, error) {
	ctx := context.Background()
	spotifyPlayer, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.SimplePlaylist{}, err
	}

	results, err := spotifyPlayer.Search(ctx, query, spotify.SearchTypePlaylist)
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.SimplePlaylist{}, err
	}

	return results.Playlists.Playlists, nil
}

func (b *Backend) GetArtistsByQuery(query string) ([]spotify.FullArtist, error) {
	ctx := context.Background()
	spotifyPlayer, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.FullArtist{}, err
	}

	results, err := spotifyPlayer.Search(ctx, query, spotify.SearchTypeArtist)
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.FullArtist{}, err
	}

	return results.Artists.Artists, nil
}

func (b *Backend) GetAlbumsByQuery(query string) ([]spotify.SimpleAlbum, error) {
	ctx := context.Background()
	spotifyPlayer, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving albums", "error", err)
		return []spotify.SimpleAlbum{}, err
	}

	results, err := spotifyPlayer.Search(ctx, query, spotify.SearchTypeAlbum)
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.SimpleAlbum{}, err
	}

	return results.Albums.Albums, nil
}

func (b *Backend) GetShowsByQuery(query string) ([]spotify.FullShow, error) {
	ctx := context.Background()
	spotifyPlayer, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving albums", "error", err)
		return []spotify.FullShow{}, err
	}

	results, err := spotifyPlayer.Search(ctx, query, spotify.SearchTypeShow)
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.FullShow{}, err
	}

	return results.Shows.Shows, nil
}

func (b *Backend) GetEpisodesByShowID(showID string) ([]spotify.EpisodePage, error) {
	ctx := context.Background()
	spotifyPlayer, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving albums", "error", err)
		return []spotify.EpisodePage{}, err
	}

	results, err := spotifyPlayer.GetShowEpisodes(ctx, showID)
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.EpisodePage{}, err
	}

	return results.Episodes, nil
}

func (b *Backend) PlayTrack(trackID string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	uris := []spotify.URI{spotify.URI("spotify:track:" + trackID)}

	return client.PlayOpt(ctx, &spotify.PlayOptions{URIs: uris})
}

func (b *Backend) PlayArtistsTopTracks(artistID string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	topTracks, err := client.GetArtistsTopTracks(ctx, spotify.ID(artistID), "US")
	if err != nil {
		slog.Error("error getting top tracks", "error", err)
		return err
	}

	uris := []spotify.URI{}
	for _, track := range topTracks {
		uris = append(uris, track.URI)
	}

	return client.PlayOpt(ctx, &spotify.PlayOptions{URIs: uris})
}

func (b *Backend) PlayPodcast(uri string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	playbackURI := spotify.URI(uri)
	return client.PlayOpt(ctx, &spotify.PlayOptions{PlaybackContext: &playbackURI})
}

func (b *Backend) PlayPlaylist(uri string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	playbackURI := spotify.URI(uri)
	return client.PlayOpt(ctx, &spotify.PlayOptions{PlaybackContext: &playbackURI})
}

func (b *Backend) PlayAlbum(uri string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	playbackURI := spotify.URI(uri)
	return client.PlayOpt(ctx, &spotify.PlayOptions{PlaybackContext: &playbackURI})
}

func (b *Backend) QueueTrack(trackID string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return err
	}

	return client.QueueSong(ctx, spotify.ID(trackID))
}

func (b *Backend) Pause() error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return err
	}

	return client.Pause(ctx)
}

func (b *Backend) Next() error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return err
	}

	return client.Next(ctx)
}

func (b *Backend) Previous() error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return err
	}

	return client.Previous(ctx)
}

func (b *Backend) Resume() error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return err
	}

	return client.Play(ctx)
}

func (b *Backend) GetDevices() ([]spotify.PlayerDevice, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return nil, err
	}

	return client.PlayerDevices(ctx)
}

func (b *Backend) SetActiveDevice(deviceID string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return err
	}

	return client.TransferPlayback(ctx, spotify.ID(deviceID), true)
}

func (b *Backend) GetVolume() (int, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		return 0, fmt.Errorf("error getting Spotify instance: %v", err)
	}

	status, err := client.PlayerState(ctx)
	if err != nil {
		return 0, fmt.Errorf("error retrieving player state: %v", err)
	}

	return int(status.Device.Volume) / 10, nil
}

func (b *Backend) SetVolume(volume int) error {
	if volume < 0 || volume > 10 {
		return fmt.Errorf("volume must be between 0 and 10")
	}

	adjustedVolume := volume * 10
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return err
	}

	return client.Volume(ctx, adjustedVolume)
}

func (b *Backend) Shuffle(shuffle bool) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error toggling shuffle", "error", err)
		return err
	}

	return client.Shuffle(ctx, shuffle)
}

func (b *Backend) IsCurrentSongLiked() (bool, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error checking if current song is liked", "error", err)
		return false, err
	}

	currentSong, err := client.PlayerCurrentlyPlaying(ctx)
	if err != nil {
		slog.Error("error checking if current song is liked", "error", err)
		return false, err
	} else if currentSong == nil || currentSong.Item == nil {
		return false, fmt.Errorf("no current song playing")
	}

	checkArray, err := client.UserHasTracks(ctx, currentSong.Item.ID)
	if err != nil {
		slog.Error("error checking if current song is liked", "error", err)
		return false, err
	}

	if len(checkArray) > 0 {
		return checkArray[0], nil
	}
	return false, nil
}

func (b *Backend) LikeCurrentSong(like bool) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error liking current song", "error", err)
		return err
	}

	currentSong, err := client.PlayerCurrentlyPlaying(ctx)
	if err != nil {
		slog.Error("error liking current song", "error", err)
		return err
	}

	if like {
		return client.AddTracksToLibrary(ctx, currentSong.Item.ID)
	}
	return client.RemoveTracksFromLibrary(ctx, currentSong.Item.ID)
}

func (b *Backend) Seek(positionMS int) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error seeking", "error", err)
		return err
	}

	return client.Seek(ctx, positionMS)
}

type CurrentlyPlayingTrack struct {
	SimpleTrack spotify.SimpleTrack `json:"item"`
}

func (b *Backend) GetCurrentlyPlayingTrack() (*CurrentlyPlayingTrack, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error seeking", "error", err)
		return nil, err
	}

	track, err := client.PlayerCurrentlyPlaying(ctx)
	if err != nil {
		slog.Error("error getting currently playing track", "error", err)
		return nil, err
	}

	if track == nil || track.Item == nil {
		return nil, nil
	}

	track.Item.SimpleTrack.Album = track.Item.Album

	return &CurrentlyPlayingTrack{
		SimpleTrack: track.Item.SimpleTrack,
	}, nil
}

func (b *Backend) IsShuffled() (bool, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error checking shuffle status", "error", err)
		return false, err
	}

	status, err := client.PlayerState(ctx)
	if err != nil {
		slog.Error("error checking shuffle status", "error", err)
		return false, err
	}

	return status.ShuffleState, nil
}

func (b *Backend) ChangeShuffle(shuffleOn bool) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error toggling shuffle", "error", err)
		return err
	}

	return client.Shuffle(ctx, shuffleOn)
}

func (b *Backend) GetRepeatState() (string, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting repeat state", "error", err)
		return "", err
	}

	status, err := client.PlayerState(ctx)
	if err != nil {
		slog.Error("error getting repeat state", "error", err)
		return "", err
	}

	return status.RepeatState, nil
}

func (b *Backend) ChangeRepeatState(repeatState string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error changing repeat state", "error", err)
		return err
	}

	return client.Repeat(ctx, repeatState)
}

func (b *Backend) AddClientID(clientID string) {
	slog.Info("Setting client ID", "clientID", clientID)
	b.managers.config.SetClientID(clientID)
}

func (b *Backend) GetClientID() string {
	return b.managers.config.GetClientID()
}

func (b *Backend) AddClientSecret(clientSecret string) {
	slog.Info("Setting client secret", "clientSecret", clientSecret)
	b.managers.config.SetClientSecret(clientSecret)
}

func (b *Backend) GetClientSecret() string {
	return b.managers.config.GetClientSecret()
}

func (b *Backend) CheckIfAuthenticatedWithSpotify() bool {
	clientID := b.managers.config.GetClientID()
	if clientID == "" || len(clientID) != 32 {
		return false
	}

	clientSecret := b.managers.config.GetClientSecret()
	if clientSecret == "" || len(clientSecret) != 32 {
		return false
	}

	return !b.managers.config.GetRequiresSpotifyAuthKey()
}

func (b *Backend) SetAuthenticatedWithSpotify(authenticated bool) {
	b.managers.config.SetRequiresSpotifyAuthKey(authenticated)
}

func (b *Backend) AuthenticateWithSpotify() error {
	clientID := b.managers.config.GetClientID()
	if clientID == "" {
		return fmt.Errorf("client ID not set")
	}

	clientSecret := b.managers.config.GetClientSecret()
	if clientSecret == "" {
		return fmt.Errorf("client secret not set")
	}

	b.authServer.StartAuthServer(b.ctx, b.managers.config, b.managers.spotifyHolder)

	auth := spotifyauth.New(
		spotifyauth.WithRedirectURL(constants.ServerURL+"/auth/callback"),
		spotifyauth.WithScopes(constants.SpotifyScopes()...),
		spotifyauth.WithClientID(clientID),
		spotifyauth.WithClientSecret(clientSecret),
	)

	url := auth.AuthURL(constants.SpotifyState)

	runtime.BrowserOpenURL(b.ctx, url)
	return nil
}

func (b *Backend) CloseAuthServer() {
	b.authServer.StopAuthServer()
}
