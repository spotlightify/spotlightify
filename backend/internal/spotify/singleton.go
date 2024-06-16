package spotify

import (
	"fmt"
	"log"
	"sync"

	"github.com/spotlightify/spotlightify/configs"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/oauth2"
)

const (
	NilInstanceError = "spotify client not initialized, please authenticate first"
)

var (
	lock     = &sync.Mutex{}
	instance *spotify.Client
)

// From docs Spotify Wrapper docs:
func GetSpotifyAuthURL(urlPath string, state string) string {
	redirectURL, ok := configs.GetConfigValue(configs.ConfigServerUrlKey).(string)
	if !ok {
		log.Fatalf("failed to get redirect URL from config")
	}

	// the redirect URL must be an exact match of a URL you've registered for your application
	// scopes determine which permissions the user is prompted to authorize
	auth := spotifyauth.New(spotifyauth.WithRedirectURL(redirectURL), spotifyauth.WithScopes(spotifyauth.ScopeUserTopRead))

	// get the user to this URL - how you do that is up to you
	// you should specify a unique state string to identify the session
	return auth.AuthURL(state)
}

func SetSpotifySingletonInstance(client *spotify.Client, token oauth2.Token) {
	lock.Lock()
	defer lock.Unlock()
	instance = client
	configs.SetConfigValue(configs.ConfigRequiresSpotifyAuthKey, false)
}

func GetSpotifyInstance() (*spotify.Client, error) {
	if instance == nil {
		return nil, fmt.Errorf(NilInstanceError)
	}

	return instance, nil
}
