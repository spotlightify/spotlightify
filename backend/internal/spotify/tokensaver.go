package spotify

import (
	"log"
	"time"

	"golang.org/x/oauth2"
)

type SpotifyTokenSaver interface {
	SetSpotifyToken(token oauth2.Token) error
}

type SpotifyTokenGetter interface {
	Token() (*oauth2.Token, error)
}

func SaveSpotifyToken(tokenGetter <-chan SpotifyTokenGetter, tokenSaver SpotifyTokenSaver) error {
	getter := <-tokenGetter
	for {
		token, err := getter.Token() // Refreshes token if expired

		if err != nil || token == nil {
			log.Println("Failed to get token;", err)
			log.Println("Waiting for new Spotify client instance to get token")
			getter = <-tokenGetter
			log.Println("New Spotify client instance, refreshing token")
			continue
		}

		log.Println("Saving token")
		err = tokenSaver.SetSpotifyToken(*token)
		if err != nil {
			log.Println("Failed to save token", err)
		}

		timeToRefreshToken := token.Expiry.Add(5 * time.Second)

		select {
		case <-tokenGetter:
			log.Println("New Spotify client instance, refreshing token")
			getter = <-tokenGetter
		case <-time.After(time.Until(timeToRefreshToken)):
			log.Println("Token expires in 5 minutes, refreshing token")
			continue
		}
	}
}
