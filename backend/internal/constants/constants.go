package constants

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
