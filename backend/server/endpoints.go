package server

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"strings"

	"spotlightify-wails/backend/configs"
	"spotlightify-wails/backend/internal/constants"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/gorilla/mux"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
)

const (
	callbackPath = "/auth/callback"
)

var (
	redirectURI string
	auth        *spotifyauth.Authenticator
)

type AuthenticationHandlers struct {
	Config       *configs.SpotlightifyConfig
	ClientHolder *spot.SpotifyClientHolder
}

func SetupAuthenticationRoutes(r *mux.Router, handlers *AuthenticationHandlers) {
	log.Println("Setting up authentication routes")
	redirectURI = constants.ServerURL + callbackPath
	auth = spotifyauth.New(spotifyauth.WithRedirectURL(redirectURI), spotifyauth.WithScopes(constants.SpotifyScopes()...))
	log.Println("Redirect URI: ", redirectURI)

	r.HandleFunc("/auth/check", handlers.checkAuthHandler)
	r.HandleFunc("/auth/login", handlers.loginHandler)
	r.HandleFunc("/auth/post-credentials", handlers.postCredentialsHandler)
	r.HandleFunc(callbackPath, handlers.callbackHandler)
	fs := http.FileServer(http.Dir("./public/"))
	r.PathPrefix("/public/").Handler(http.StripPrefix("/public/", fs))
	log.Println("Finished setting up authentication routes")
}

func (a *AuthenticationHandlers) checkAuthHandler(w http.ResponseWriter, r *http.Request) { // TODO This should be polled from the client side
	// Check if the user is authenticated
	isRequired := a.Config.GetRequiresSpotifyAuthKey()

	w.Header().Set("Content-Type", "application/json")
	if isRequired {
		w.Write([]byte(`{"requiresAuth": true}`))
	} else {
		w.Write([]byte(`{"requiresAuth": false}`))
	}
}

type AccessToken struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Expires      *int   `json:"expires,omitempty"` // Pointer to int to allow for omission/nil
}

type TemplateVars struct {
	WasRedirected bool // Whether the user was redirected from the /callback endpoint
	IsSuccess     bool
	ErrorMessage  string
	AuthUrl       string
}

type clientDetails struct {
	ClientId     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
}

func (a *AuthenticationHandlers) loginHandler(w http.ResponseWriter, r *http.Request) {
	a.loadLoginPage(w, r, true, nil)
}

func (a *AuthenticationHandlers) loadLoginPage(w http.ResponseWriter, r *http.Request, isPreAuth bool, err error) {
	loginTemplate, tmplErr := template.ParseFiles("public/auth/indexHtml.tmpl")
	if tmplErr != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var templateVars TemplateVars
	if !isPreAuth && err == nil {
		templateVars = TemplateVars{WasRedirected: true, IsSuccess: true}
	} else if err != nil {
		templateVars = TemplateVars{WasRedirected: true, IsSuccess: false, ErrorMessage: err.Error()}
	}

	loginTemplate.Execute(w, templateVars)
}

func (a *AuthenticationHandlers) postCredentialsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var clientDetailsResponse clientDetails

	err := json.NewDecoder(r.Body).Decode(&clientDetailsResponse)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	a.Config.SetClientID(clientDetailsResponse.ClientId)
	a.Config.SetClientSecret(clientDetailsResponse.ClientSecret)
}

func (a *AuthenticationHandlers) callbackHandler(w http.ResponseWriter, r *http.Request) {
	spotifyID := a.Config.GetClientID()
	spotifySecret := a.Config.GetClientSecret()
	log.Println("Spotify ID:", spotifyID)
	censoredSecret := strings.Repeat("*", len(spotifySecret))
	log.Println("Spotify Secret:", censoredSecret)

	auth = spotifyauth.New(
		spotifyauth.WithClientID(spotifyID),
		spotifyauth.WithClientSecret(spotifySecret),
		spotifyauth.WithRedirectURL(redirectURI),
		spotifyauth.WithScopes(constants.SpotifyScopes()...),
	)
	tok, err := auth.Token(r.Context(), constants.SpotifyState, r)
	if err != nil {
		http.Error(w, "Couldn't get token", http.StatusForbidden)
		log.Panicln(err)
	}
	if st := r.FormValue("state"); st != constants.SpotifyState {
		http.NotFound(w, r)
		log.Printf("State mismatch: %s != %s\n", st, constants.SpotifyState)
	}

	// use the token to get an authenticated client
	log.Println("Creating spotify client with access token...")
	client := spotify.New(auth.Client(r.Context(), tok))
	a.ClientHolder.SetSpotifyInstance(client)
	log.Println("Logged in successfully!")

	// Redirect to the frontend
	a.redirectToLogin(w, r, nil)
}

func (a *AuthenticationHandlers) redirectToLogin(w http.ResponseWriter, r *http.Request, err error) {
	a.loadLoginPage(w, r, false, err)
}
