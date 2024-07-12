package constants

import "fmt"

const (
	Port         = ":49264"
	ServerURL    = "http://localhost" + Port
	SpotifyState = "spotlightify-state"
)

func SpotifyScopes() []string {
	return []string{
		"streaming user-library-read",
		"user-modify-playback-state",
		"user-read-playback-state",
		"user-library-modify",
		"user-follow-read",
		"playlist-read-private",
		"playlist-read-collaborative",
		"user-follow-read", // Note: This scope is duplicated.
		"playlist-modify-public",
		"playlist-modify-private",
	}
}

type Icon string

const (
	IconAlbum            Icon = "album.svg"
	IconArtist           Icon = "artist.svg"
	IconAuthenticate     Icon = "authenticate.svg"
	IconBackNav          Icon = "back-nav.svg"
	IconBackward         Icon = "backward.svg"
	IconCog              Icon = "cog.svg"
	IconDevice           Icon = "device.svg"
	IconEllipsis         Icon = "ellipsis.svg"
	IconExit             Icon = "exit.svg"
	IconForwardNav       Icon = "forward-nav.svg"
	IconForward          Icon = "forward.svg"
	IconGoArrow          Icon = "go-arrow.svg"
	IconHeartNoFill      Icon = "heart-no-fill.svg"
	IconHeart            Icon = "heart.svg"
	IconMoon             Icon = "moon.svg"
	IconNoTexture        Icon = "no-texture.svg"
	IconPauseButtonLight Icon = "pause-button-light.svg"
	IconPauseButton      Icon = "pause-button.svg"
	IconPause            Icon = "pause.svg"
	IconPlay             Icon = "play.svg"
	IconPlus             Icon = "plus.svg"
	IconPlaylist         Icon = "playlist.svg"
	IconQueueLight       Icon = "queue-light.svg"
	IconQueue            Icon = "queue.svg"
	IconRadio            Icon = "radio.svg"
	IconRepeat           Icon = "repeat.svg"
	IconSearch           Icon = "search.svg"
	IconShare            Icon = "share.svg"
	IconShuffleOff       Icon = "shuffle-off.svg"
	IconShuffle          Icon = "shuffle.svg"
	IconSpotifyLogo      Icon = "spotify-logo.svg"
	IconSun              Icon = "sun.svg"
	IconVolumeLight      Icon = "volume-light.svg"
	IconVolume           Icon = "volume.svg"
)

func GetIconAddress(icon Icon) string {
	return fmt.Sprintf("src/assets/svg/%s", icon)
}
