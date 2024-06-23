package spotify

import (
	"errors"
	"sync"

	"github.com/zmb3/spotify/v2"
)

const (
	SpotifyInstanceNotInitialisedError = "spotify instance not initialised"
)

type SpotifyClientHolder struct {
	client *spotify.Client // TODO write an interface for this
	mu     *sync.RWMutex
}

func (s *SpotifyClientHolder) SetSpotifyInstance(client *spotify.Client) (*spotify.Client, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.client == nil {
		return nil, errors.New(SpotifyInstanceNotInitialisedError)
	}

	return s.client, nil
}

func (s *SpotifyClientHolder) GetSpotifyInstance() (*spotify.Client, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.client == nil {
		return nil, errors.New(SpotifyInstanceNotInitialisedError)
	}

	return s.client, nil
}

func NewSpotifyClientHolder() *SpotifyClientHolder {
	return &SpotifyClientHolder{
		mu: &sync.RWMutex{},
	}
}
