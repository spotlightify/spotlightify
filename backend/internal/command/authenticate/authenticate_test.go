package authenticate

import (
	"context"
	"fmt"
	"testing"

	"github.com/spotlightify/spotlightify/internal/constants"
	"github.com/spotlightify/spotlightify/internal/utils"
	"github.com/stretchr/testify/assert"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
)

type mockAuthConfig struct {
	clientID     string
	clientSecret string
}

func (t *mockAuthConfig) SetClientID(clientID string) {
	t.clientID = clientID
}

func (t *mockAuthConfig) SetClientSecret(clientSecret string) {
	t.clientSecret = clientSecret
}

func (t *mockAuthConfig) GetClientID() string {
	return t.clientID
}

func (t *mockAuthConfig) GetClientSecret() string {
	return t.clientSecret
}

func TestAuthenticateCommand_GetSuggestions(t *testing.T) {
	mockAuthConfig := mockAuthConfig{}
	authCommand := &authenticateCommand{
		config: &mockAuthConfig,
	}

	t.Run("Shows main menu suggestions with no parameters", func(t *testing.T) {
		input := "anything"
		parameters := map[string]string{}

		ctx := context.Background()

		suggestions := authCommand.GetSuggestions(input, parameters, ctx)

		titles := []string{OpenAuthenticationInstructionsTitle, AddSpotifyClientIDTitle, AddSpotifyClientSecretTitle, AuthenticateWithSpotifyTitle}
		descriptions := []string{OpenAuthenticationInstructionsDescription, AddSpotifyClientIDDescription, AddSpotifyClientSecretDescription, AuthenticateWithSpotifyDescription}

		assert.NotNil(t, suggestions)
		utils.AssertSuggestionTitlesAndDescriptions(t, suggestions, titles, descriptions)
	})

	t.Run("Shows main menu suggestions with client_id and client_secret parameters", func(t *testing.T) {
		input := "anything"

		clientId := "client_id_param"
		clientSecret := "client_secret_param"

		parameters := map[string]string{
			"client_id":     clientId,
			"client_secret": clientSecret,
		}

		ctx := context.Background()

		suggestions := authCommand.GetSuggestions(input, parameters, ctx)

		titles := []string{OpenAuthenticationInstructionsTitle, ChangeClientIDTitle, ChangeClientSecretTitle, AuthenticateWithSpotifyTitle}
		descriptions := []string{OpenAuthenticationInstructionsDescription, fmt.Sprintf(ChangeClientIDDescription, clientId), fmt.Sprintf(ChangeClientSecretDescription, clientSecret), AuthenticateWithSpotifyDescription}

		assert.NotNil(t, suggestions)
		utils.AssertSuggestionTitlesAndDescriptions(t, suggestions, titles, descriptions)
	})

	t.Run("Shows main menu suggestions with client_id and client_secret from config", func(t *testing.T) {
		input := "anything"

		clientId := "client_id_param"
		clientSecret := "client_secret_param"

		mockAuthConfig.clientID = clientId
		mockAuthConfig.clientSecret = clientSecret

		parameters := map[string]string{}

		ctx := context.Background()

		suggestions := authCommand.GetSuggestions(input, parameters, ctx)

		titles := []string{OpenAuthenticationInstructionsTitle, ChangeClientIDTitle, ChangeClientSecretTitle, AuthenticateWithSpotifyTitle}
		descriptions := []string{OpenAuthenticationInstructionsDescription, fmt.Sprintf(ChangeClientIDDescription, clientId), fmt.Sprintf(ChangeClientSecretDescription, clientSecret), AuthenticateWithSpotifyDescription}

		assert.NotNil(t, suggestions)
		utils.AssertSuggestionTitlesAndDescriptions(t, suggestions, titles, descriptions)
	})

	t.Run("Shows menu to change client id with input", func(t *testing.T) {
		input := "new client id"

		parameters := map[string]string{"selected-menu": "client_id"}

		ctx := context.Background()

		suggestions := authCommand.GetSuggestions(input, parameters, ctx)

		titles := []string{InputClientIDTitle, BackTitle}
		descriptions := []string{fmt.Sprintf(InputClientIDDescription, input), BackDescription}

		assert.NotNil(t, suggestions)
		utils.AssertSuggestionTitlesAndDescriptions(t, suggestions, titles, descriptions)
	})
	t.Run("Shows menu to change client secret with input", func(t *testing.T) {
		input := "new client secret"

		parameters := map[string]string{"selected-menu": "client_secret"}

		ctx := context.Background()

		suggestions := authCommand.GetSuggestions(input, parameters, ctx)

		titles := []string{InputClientSecretTitle, BackTitle}
		descriptions := []string{fmt.Sprintf(InputClientSecretDescription, input), BackDescription}

		assert.NotNil(t, suggestions)
		utils.AssertSuggestionTitlesAndDescriptions(t, suggestions, titles, descriptions)
	})
}

func TestAuthenticateCommand_Execute(t *testing.T) {
	t.Run("Open authentication instructions in browser", func(t *testing.T) {
		wantedURL := constants.ServerURL + "/public/auth/auth_instructions.html"
		openedBrowserWithWantedUrl := false

		authCommand := &authenticateCommand{
			urlOpener: func(url string) error {
				if url == wantedURL {
					openedBrowserWithWantedUrl = true
				}

				return nil
			},
		}

		parameters := map[string]string{
			"open_instructions": "true",
		}

		ctx := context.Background()

		output := authCommand.Execute(parameters, ctx)

		assert.Nil(t, output)
		assert.True(t, openedBrowserWithWantedUrl)
	})

	t.Run("Open browser with Spotify authentication URL", func(t *testing.T) {
		clientId := "fake_client_id"
		clientSecret := "fake_client_secret"

		auth := spotifyauth.New(
			spotifyauth.WithRedirectURL(constants.ServerURL+"/auth/callback"),
			spotifyauth.WithScopes(constants.SpotifyScopes()...),
			spotifyauth.WithClientID(clientId),
			spotifyauth.WithClientSecret(clientSecret),
		)

		wantedURL := auth.AuthURL(constants.SpotifyState)
		openedBrowserWithWantedUrl := false

		authCommand := &authenticateCommand{
			urlOpener: func(url string) error {
				if url == wantedURL {
					openedBrowserWithWantedUrl = true
				}

				return nil
			},
			config: &mockAuthConfig{},
		}

		parameters := map[string]string{
			"client_id":     clientId,
			"client_secret": clientSecret,
		}

		ctx := context.Background()

		output := authCommand.Execute(parameters, ctx)

		assert.Nil(t, output)
		assert.True(t, openedBrowserWithWantedUrl)
		assert.Equal(t, clientId, authCommand.config.GetClientID())
		assert.Equal(t, clientSecret, authCommand.config.GetClientSecret())
	})
}

func TestAuthenticateCommand_GetPlaceholderSuggestion(t *testing.T) {
	authCommand := &authenticateCommand{}

	suggestion := authCommand.GetPlaceholderSuggestion()

	assert.NotNil(t, suggestion)
	assert.Equal(t, AuthenticatePlaceholderTitle, suggestion.Title)
	assert.Equal(t, AuthenticatePlaceholderDescription, suggestion.Description)
	assert.Equal(t, "spotify", suggestion.Icon)
	assert.Equal(t, "authenticate-spotify", suggestion.ID)
}
