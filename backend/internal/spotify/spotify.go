package spotify

import (
	"context"
	"errors"
	"log"
	"sync"

	"github.com/spotlightify/spotlightify/internal/constants"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"

	"golang.org/x/oauth2"
)

const (
	SpotifyInstanceNotInitialisedError = "spotify instance not initialised"
)

type SpotifyClientHolder struct {
	client          *spotify.Client
	mu              *sync.RWMutex
	tokenGetterChan chan<- SpotifyTokenGetter
}

func (s *SpotifyClientHolder) SetSpotifyInstance(client *spotify.Client) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.client = client

	if client == nil {
		log.Println("Spotify client instance not initialised")
		return
	}
	log.Println("Spotify client instance initialised")
	s.tokenGetterChan <- client
}

func (s *SpotifyClientHolder) GetSpotifyInstance() (*spotify.Client, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.client == nil {
		return nil, errors.New(SpotifyInstanceNotInitialisedError)
	}

	return s.client, nil
}

type SpotifyCredsLoader interface {
	GetSpotifyToken() (*oauth2.Token, error)
	GetClientID() string
	GetClientSecret() string
}

func (s *SpotifyClientHolder) LoadSpotifyTokenFromConfig(loader SpotifyCredsLoader) error {
	token, error := loader.GetSpotifyToken()
	if error != nil {
		return error
	}

	clientId := loader.GetClientID()
	if clientId == "" {
		return errors.New("no client id found in config")
	}

	clientSecret := loader.GetClientSecret()
	if clientSecret == "" {
		return errors.New("no client client secret found in config")
	}

	auth := spotifyauth.New(spotifyauth.WithRedirectURL(constants.ServerURL),
		spotifyauth.WithScopes(constants.SpotifyScopes()...),
		spotifyauth.WithClientID(clientId),
		spotifyauth.WithClientSecret(clientSecret),
	)

	s.SetSpotifyInstance(spotify.New(auth.Client(context.Background(), token)))
	return nil
}

func NewSpotifyClientHolder(tokenSaver SpotifyTokenSaver) *SpotifyClientHolder {
	tokenGetterChan := make(chan SpotifyTokenGetter)

	// This go routine will run in the background and will save the token
	// if either a new spotify client is set or the token is about to expire
	go SaveSpotifyToken(tokenGetterChan, tokenSaver)

	return &SpotifyClientHolder{
		mu:              &sync.RWMutex{},
		tokenGetterChan: tokenGetterChan,
	}
}
