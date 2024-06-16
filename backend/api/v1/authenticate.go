package v1

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"strings"

	"github.com/gorilla/mux"
	"github.com/spotlightify/spotlightify/configs"
	"github.com/spotlightify/spotlightify/internal/spotify"
)

func SetupAuthenticationRoutes(r *mux.Router) {
	r.HandleFunc("/auth/check", checkAuthHandler)
	r.HandleFunc("/auth/login", loginHandler)
	r.HandleFunc("/auth/post-credentials", postCredentialsHandler)
	r.HandleFunc(callbackPath, callbackHandler)
	fs := http.FileServer(http.Dir("./public/"))
	r.PathPrefix("/public/").Handler(http.StripPrefix("/public/", fs))
}

func checkAuthHandler(w http.ResponseWriter, r *http.Request) {
	// Check if the user is authenticated
	isRequired := configs.GetConfigValue(configs.ConfigRequiresSpotifyAuthKey)
	if isRequired == nil {
		http.Error(w, "Failed to get config value", http.StatusInternalServerError)
		return
	}

	isRequiredBool, ok := isRequired.(bool)
	if !ok {
		http.Error(w, "Failed to convert config value to bool", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if isRequiredBool {
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

const (
	port         = 5000
	state        = "spotlightify-state"
	callbackPath = "/auth/callback"
)

var redirectUri = fmt.Sprintf("http://localhost:%d/auth/callback", port)

type clientDetails struct {
	ClientId     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
}

var (
	client = clientDetails{}
)

var scopes = []string{
	"streaming user-library-read",
	"user-modify-playback-state",
	"user-read-playback-state",
	"user-library-modify",
	"user-follow-read",
	"playlist-read-private",
	"playlist-read-collaborative",
	"user-follow-read",
	"playlist-modify-public",
	"playlist-modify-private",
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	loadLoginPage(w, r, true, nil)
}

func loadLoginPage(w http.ResponseWriter, r *http.Request, isPreAuth bool, err error) {
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

	templateVars.AuthUrl = spotify.GetSpotifyAuthURL(callbackPath, state)

	loginTemplate.Execute(w, templateVars)
}

func postCredentialsHandler(w http.ResponseWriter, r *http.Request) {
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

	client = clientDetailsResponse
}

func callbackHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Code query parameter not found", http.StatusBadRequest)
		return
	}

	state := r.URL.Query().Get("state")
	if state == "" {
		http.Error(w, "State query parameter not found", http.StatusBadRequest)
		return
	}

	// Prepare the request parameters
	data := url.Values{}
	data.Set("code", code)
	data.Set("redirect_uri", redirectUri)
	data.Set("grant_type", "authorization_code")

	// Prepare the Authorization header
	auth := client.ClientId + ":" + client.ClientSecret
	authEncoded := base64.StdEncoding.EncodeToString([]byte(auth))

	// Create the HTTP client
	client := &http.Client{}

	// Create and execute the request
	req, err := http.NewRequest("POST", "https://accounts.spotify.com/api/token", strings.NewReader(data.Encode()))
	if err != nil {
		err = fmt.Errorf("Error creating request: %s", err)
		redirectToLogin(w, r, err)
		return
	}

	// Add headers to the request
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Authorization", "Basic "+authEncoded)

	// Execute the request
	resp, err := client.Do(req)
	if err != nil {
		err = fmt.Errorf("Error fetching token: %s", err)
		redirectToLogin(w, r, err)
		return
	}
	defer resp.Body.Close()

	// Check if the response is successful
	if resp.StatusCode != http.StatusOK {
		err = fmt.Errorf("Error fetching token: %s", resp.Status)
		redirectToLogin(w, r, err)
		return
	}

	var accessToken AccessToken

	// Read the response body
	err = json.NewDecoder(resp.Body).Decode(&accessToken)
	if err != nil {
		redirectToLogin(w, r, err)
		return
	}

	fmt.Printf("Access token struct: %+v\n", accessToken)

	// Redirect to the frontend
	redirectToLogin(w, r, nil)
}

func redirectToLogin(w http.ResponseWriter, r *http.Request, err error) {
	loadLoginPage(w, r, false, err)
}
