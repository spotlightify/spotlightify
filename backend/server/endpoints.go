package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"spotlightify-wails/backend/configs"
	"spotlightify-wails/backend/internal/constants"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/gorilla/mux"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"

	_ "embed"
)

const (
	callbackPath = "/auth/callback"
)

var (
	redirectURI string
	auth        *spotifyauth.Authenticator
)

//go:embed success.html
var successHTML string

type AuthenticationHandlers struct {
	Config         *configs.SpotlightifyConfig
	ClientHolder   *spot.SpotifyClientHolder
	WailsContext   context.Context
	ShutdownServer func(context.Context) error
}

func SetupAuthenticationRoutes(r *mux.Router, handlers *AuthenticationHandlers) {
	slog.Info("Setting up authentication routes")
	redirectURI = constants.ServerURL + callbackPath
	auth = spotifyauth.New(spotifyauth.WithRedirectURL(redirectURI), spotifyauth.WithScopes(constants.SpotifyScopes()...))
	slog.Info("Redirect URI: ", redirectURI)

	r.HandleFunc(callbackPath, handlers.callbackHandler)
	slog.Info("Finished setting up authentication routes")
}

type AccessToken struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Expires      *int   `json:"expires,omitempty"` // Pointer to int to allow for omission/nil
}

func (a *AuthenticationHandlers) handleSuccessInUI() {
	runtime.EventsEmit(a.WailsContext, "auth_success", "auth_success")
}

func (a *AuthenticationHandlers) handleFailureInUI(err error) {
	runtime.EventsEmit(a.WailsContext, "auth_failure", err.Error())
}

func (a *AuthenticationHandlers) callbackHandler(w http.ResponseWriter, r *http.Request) {
	shutdownServer := func() {
		shutdownRoutine := func() {
			slog.Info("Shutting down server in 10 seconds")
			time.Sleep(10 * time.Second)
			slog.Info("Shutting down server now")
			err := a.ShutdownServer(context.Background())
			if err != nil {
				slog.Error("Error shutting down server", "error", err)
			}
		}

		go shutdownRoutine()
	}

	spotifyID := a.Config.GetClientID()
	spotifySecret := a.Config.GetClientSecret()
	slog.Info("Spotify ID:" + spotifyID)
	censoredSecret := strings.Repeat("*", len(spotifySecret))
	slog.Info("Spotify Secret:" + censoredSecret)

	auth = spotifyauth.New(
		spotifyauth.WithClientID(spotifyID),
		spotifyauth.WithClientSecret(spotifySecret),
		spotifyauth.WithRedirectURL(redirectURI),
		spotifyauth.WithScopes(constants.SpotifyScopes()...),
	)
	tok, err := auth.Token(r.Context(), constants.SpotifyState, r)
	if err != nil {
		http.Error(w, "Couldn't get token", http.StatusForbidden)
		slog.Error("Couldn't get token", "error", err)
		a.handleFailureInUI(err)
		shutdownServer()
		return
	}
	if st := r.FormValue("state"); st != constants.SpotifyState {
		http.NotFound(w, r)
		slog.Error(fmt.Sprintf("State mismatch: %s != %s\n", st, constants.SpotifyState))
		a.handleFailureInUI(fmt.Errorf("state mismatch: %s != %s", st, constants.SpotifyState))
		shutdownServer()
		return
	}

	// use the token to get an authenticated client
	slog.Info("Creating spotify client with access token...")
	client := spotify.New(auth.Client(r.Context(), tok))
	a.ClientHolder.SetSpotifyInstance(client)
	slog.Info("Logged in successfully!")
	a.Config.SetRequiresSpotifyAuth(false)
	a.handleSuccessInUI()

	_, err = w.Write([]byte(successHTML))
	if err != nil {
		slog.Error("Error writing success HTML", "error", err)
	}
	shutdownServer()
}
