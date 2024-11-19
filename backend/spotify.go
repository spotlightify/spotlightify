package backend

import (
	"context"
	"fmt"
	"log/slog"
	"spotlightify-wails/backend/internal/constants"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
)

func (b *Backend) GetTracksByQuery(query string) ([]spotify.SimpleTrack, error) {
	ctx := context.Background()
	spotifyPlayer, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting Spotify instance", "error", err)
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
		slog.Error("error getting Spotify instance", "error", err)
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
		slog.Error("error getting Spotify instance", "error", err)
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
		slog.Error("error getting Spotify instance", "error", err)
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
		slog.Error("error getting Spotify instance", "error", err)
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
		slog.Error("error getting Spotify instance", "error", err)
		return []spotify.EpisodePage{}, err
	}

	results, err := spotifyPlayer.GetShowEpisodes(ctx, showID)
	if err != nil {
		slog.Error("error retrieving tracks", "error", err)
		return []spotify.EpisodePage{}, err
	}

	return results.Episodes, nil
}

func (b *Backend) deviceSelector() spotify.ID {
	deviceToPlayOn := ""
	if activeDevice := b.managers.config.GetActiveDevice(); activeDevice != "" {
		deviceToPlayOn = activeDevice
	} else if defaultDevice := b.managers.config.GetDefaultDevice(); defaultDevice != "" {
		deviceToPlayOn = defaultDevice
	}

	return spotify.ID(deviceToPlayOn)
}

func (b *Backend) PlayAnythingToDevice(ctx context.Context, playOptions *spotify.PlayOptions) error {
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting Spotify instance", "error", err)
		return err
	}

	deviceID := b.deviceSelector()
	playOptions.DeviceID = &deviceID

	err = client.PlayOpt(ctx, playOptions)
	if err != nil {
		slog.Error("error playing track", "error", err)
	}
	return err
}

func (b *Backend) PlayTrack(URI string) error {
	err := b.PlayAnythingToDevice(context.Background(), &spotify.PlayOptions{URIs: []spotify.URI{spotify.URI(URI)}})
	if err != nil {
		slog.Error("error playing track", "error", err)
	}
	return err
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

	deviceID := b.deviceSelector()
	err = client.PlayOpt(ctx, &spotify.PlayOptions{URIs: uris, DeviceID: &deviceID})
	if err != nil {
		slog.Error("error playing top tracks", "error", err)
	}
	return err
}

func (b *Backend) PlayPodcast(uri string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	playbackURI := spotify.URI(uri)
	err = client.PlayOpt(ctx, &spotify.PlayOptions{PlaybackContext: &playbackURI})
	if err != nil {
		slog.Error("error playing podcast", "error", err)
	}
	return err
}

func (b *Backend) PlayPlaylist(uri string) error {
	playbackURI := spotify.URI(uri)
	err := b.PlayAnythingToDevice(context.Background(), &spotify.PlayOptions{PlaybackContext: &playbackURI})
	if err != nil {
		slog.Error("error playing playlist", "error", err)
	}
	return err
}

func (b *Backend) PlayAlbum(uri string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	playbackURI := spotify.URI(uri)
	err = client.PlayOpt(ctx, &spotify.PlayOptions{PlaybackContext: &playbackURI})
	if err != nil {
		slog.Error("error playing album", "error", err)
	}
	return err
}

func (b *Backend) QueueTrack(trackID string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	err = client.QueueSong(ctx, spotify.ID(trackID))
	if err != nil {
		slog.Error("error queueing track", "error", err)
	}
	return err
}

func (b *Backend) Pause() error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	err = client.Pause(ctx)
	if err != nil {
		slog.Error("error pausing track", "error", err)
	}
	return err
}

func (b *Backend) Next() error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	err = client.Next(ctx)
	if err != nil {
		slog.Error("error skipping track", "error", err)
	}
	return err
}

func (b *Backend) Previous() error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return err
	}

	err = client.Previous(ctx)
	if err != nil {
		slog.Error("error skipping track", "error", err)
	}
	return err
}

func (b *Backend) Resume() error {
	ctx := context.Background()

	err := b.PlayAnythingToDevice(ctx, &spotify.PlayOptions{})
	if err != nil {
		slog.Error("error playing track", "error", err)
	}
	return err
}

func (b *Backend) GetDevices() ([]spotify.PlayerDevice, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return []spotify.PlayerDevice{}, err
	}

	devices, err := client.PlayerDevices(ctx)
	if err != nil {
		slog.Error("error retrieving devices", "error", err)
		return nil, err
	}
	return devices, nil
}

func (b *Backend) SetActiveDevice(deviceID string) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting Spotify instance", "error", err)
		return err
	}

	b.managers.config.SetActiveDevice(deviceID)
	b.managers.config.SetDefaultDevice(deviceID)

	err = client.TransferPlayback(ctx, spotify.ID(deviceID), true)
	if err != nil {
		slog.Error("error transferring playback", "error", err)
	}
	return err
}

func (b *Backend) GetActiveDevice() (spotify.PlayerDevice, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting Spotify instance", "error", err)
		return spotify.PlayerDevice{}, err
	}

	devices, err := client.PlayerDevices(ctx)
	if err != nil {
		slog.Error("error retrieving devices", "error", err)
		return spotify.PlayerDevice{}, err
	}

	for _, device := range devices {
		if device.Active {
			return device, nil
		}
	}

	return spotify.PlayerDevice{}, fmt.Errorf("active device not found")
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

	err = client.Volume(ctx, adjustedVolume)
	if err != nil {
		slog.Error("error setting volume", "error", err)
	}
	return err
}

func (b *Backend) Shuffle(shuffle bool) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting Spotify instance", "error", err)
		return err
	}

	err = client.Shuffle(ctx, shuffle)
	if err != nil {
		slog.Error("error toggling shuffle", "error", err)
	}
	return err
}

func (b *Backend) IsCurrentSongLiked() (bool, error) {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting Spotify instance", "error", err)
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
		err = client.AddTracksToLibrary(ctx, currentSong.Item.ID)
	} else {
		err = client.RemoveTracksFromLibrary(ctx, currentSong.Item.ID)
	}
	return err
}

func (b *Backend) Seek(positionMS int) error {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error seeking", "error", err)
		return err
	}

	err = client.Seek(ctx, positionMS)
	if err != nil {
		slog.Error("error seeking", "error", err)
	}
	return err
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

	err = client.Shuffle(ctx, shuffleOn)
	if err != nil {
		slog.Error("error toggling shuffle", "error", err)
	}
	return err
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

	err = client.Repeat(ctx, repeatState)
	if err != nil {
		slog.Error("error changing repeat state", "error", err)
	}
	return err
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

	return !b.managers.config.GetRequiresSpotifyAuth()
}

func (b *Backend) SetAuthenticatedWithSpotify(authenticated bool) {
	b.managers.config.SetRequiresSpotifyAuth(authenticated)
}

type authEventEmitter struct {
	window *application.WebviewWindow
}

func (a *authEventEmitter) EmitSuccess() {
	slog.Info("Auth Success")
	a.window.EmitEvent("auth_success", "auth_success")
}

func (a *authEventEmitter) EmitFailure(err error) {
	slog.Error("Auth Failure", "error", err)
	a.window.EmitEvent("auth_failure", err.Error())
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

	b.authServer.StartAuthServer(b.ctx, b.managers.config, b.managers.spotifyHolder, &authEventEmitter{window: b.spotlightifyWindow})

	auth := spotifyauth.New(
		spotifyauth.WithRedirectURL(constants.ServerURL+"/auth/callback"),
		spotifyauth.WithScopes(constants.SpotifyScopes()...),
		spotifyauth.WithClientID(clientID),
		spotifyauth.WithClientSecret(clientSecret),
	)

	url := auth.AuthURL(constants.SpotifyState)

	b.app.BrowserOpenURL(url)
	return nil
}

func (b *Backend) CloseAuthServer() {
	b.authServer.StopAuthServer()
}

func (b *Backend) PlayLiked() {
	ctx := context.Background()
	client, err := b.managers.spotifyHolder.GetSpotifyInstance()
	if err != nil {
		slog.Error("error getting spotify instance", "error", err)
		return
	}

	likedTracks, err := client.CurrentUsersTracks(ctx, spotify.Limit(50))
	if err != nil {
		slog.Error("error getting liked tracks", "error", err)
		return
	}

	uris := []spotify.URI{}
	for _, track := range likedTracks.Tracks {
		uris = append(uris, track.SimpleTrack.URI)
	}

	client.PlayOpt(ctx, &spotify.PlayOptions{URIs: uris})
}
