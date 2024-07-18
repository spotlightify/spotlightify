package authenticate

import (
	"context"
	"fmt"
	"log"

	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/constants"
	"spotlightify-wails/backend/internal/model"
	"spotlightify-wails/backend/internal/spotify"

	"github.com/pkg/browser"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
)

// Suggestion Titles, declare here for testing purposes
const (
	AuthenticatePlaceholderTitle       = "Authenticate"
	AuthenticatePlaceholderDescription = "Authenticate with Spotify to access your library"

	AuthenticateWithSpotifyTitle       = "Authenticate with Spotify"
	AuthenticateWithSpotifyDescription = "Authenticate with Spotify to access your playlists and songs"

	OpenAuthenticationInstructionsTitle       = "Open authentication instructions"
	OpenAuthenticationInstructionsDescription = "Open a new browser window with instructions on how to authenticate with Spotify"

	AddSpotifyClientIDTitle       = "Add Spotify Client ID"
	AddSpotifyClientIDDescription = "You need to add a Spotify Client ID to authenticate with Spotify"

	InputClientIDTitle       = "Add Client ID"
	InputClientIDDescription = "Client ID: '%s'"

	InputClientSecretTitle       = "Add Client Secret"
	InputClientSecretDescription = "Client Secret: '%s'"

	ChangeClientIDTitle       = "Change Client ID"
	ChangeClientIDDescription = "Client ID: '%s'"

	AddSpotifyClientSecretTitle       = "Add Spotify Client Secret"
	AddSpotifyClientSecretDescription = "You need to add a Spotify Secret Key to authenticate with Spotify"

	ChangeClientSecretTitle       = "Change Client Secret"
	ChangeClientSecretDescription = "Client Secret: '%s'"

	BackTitle       = "Back"
	BackDescription = "Go back to the main menu"
)

var commandModel = model.Command{
	ID:          "authenticate",
	Name:        "Authenticate",
	Description: "Authenticate with Spotify",
	Icon:        constants.GetIconAddress(constants.IconAuthenticate),
	TriggerWord: "authenticate",
	Properties: model.CommandProperties{
		Title:           "Auth",
		ShorthandTitle:  "🌐",
		DebounceMS:      0,
		KeepPromptOpen:  true,
		PlaceholderText: "Spotify Authentication",
	},
	Parameters: map[string]string{},
	PromptText: "",
}

type authConfig interface {
	SetClientID(clientID string)
	SetClientSecret(clientSecret string)
	GetClientID() string
	GetClientSecret() string
}

type authenticateCommand struct {
	config    authConfig
	urlOpener func(string) error
}

func (c *authenticateCommand) Execute(parameters map[string]string, ctx context.Context) model.ExecuteActionOutput {
	if parameters["open_instructions"] == "true" {
		err := c.urlOpener(constants.ServerURL + "/public/auth/auth_instructions.html")
		if err != nil {
			log.Printf("failed to open browser: %v", err)
		}
		return model.ExecuteActionOutput{}
	}

	clientId := parameters["client_id"]
	c.config.SetClientID(clientId)

	clientSecret := parameters["client_secret"]
	c.config.SetClientSecret(clientSecret)

	if clientId == "" || clientSecret == "" {
		return model.ExecuteActionOutput{}
	}

	auth := spotifyauth.New(
		spotifyauth.WithRedirectURL(constants.ServerURL+"/auth/callback"),
		spotifyauth.WithScopes(constants.SpotifyScopes()...),
		spotifyauth.WithClientID(clientId),
		spotifyauth.WithClientSecret(clientSecret),
	)

	url := auth.AuthURL(constants.SpotifyState)
	fmt.Println("Please log in to Spotify by visiting the following page in your browser:", url)

	err := c.urlOpener(url)
	if err != nil {
		log.Printf("failed to open browser: %v", err)
	}
	return model.ExecuteActionOutput{}
}

func (c *authenticateCommand) GetSuggestions(input string, parameters map[string]string, ctx context.Context) model.SuggestionList {
	selectedMenu := parameters["selected-menu"]

	switch selectedMenu {
	case "client_id":
		return getClientIdSuggestions(input, parameters)
	case "client_secret":
		return getClientSecretSuggestions(input, parameters)
	default:
		return c.getMainMenuSuggestions(parameters)
	}

}

func (c *authenticateCommand) getMainMenuSuggestions(parameters map[string]string) model.SuggestionList {
	slb := builders.NewSuggestionListBuilder()

	slb.AddSuggestion(model.Suggestion{
		Title:       "Open authentication instructions",
		Description: "Open a new browser window with instructions on how to authenticate with Spotify",
		Icon:        constants.GetIconAddress(constants.IconEllipsis),
		ID:          "open-authentication-instructions",
		Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
			CommandId:           "authenticate",
			ExecutionParameters: map[string]string{"open_instructions": "true"},
		}).Build(),
	})

	clientId := parameters["client_id"]
	if clientId == "" {
		clientId = c.config.GetClientID()
	}

	clientSecret := parameters["client_secret"]
	if clientSecret == "" {
		clientSecret = c.config.GetClientSecret()
	}

	newClientIdParams := make(map[string]string)
	for key, value := range parameters {
		newClientIdParams[key] = value
	}
	newClientIdParams["selected-menu"] = "client_id"

	if clientId == "" {
		slb.AddSuggestion(model.Suggestion{
			Title:       AddSpotifyClientIDTitle,
			Description: AddSpotifyClientIDDescription,
			Icon:        constants.GetIconAddress(constants.IconPlus),
			ID:          "add-spotify-client-id",
			Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
				SetCurrentCommandParameters: newClientIdParams,
			}).Build(),
		})
	} else {
		slb.AddSuggestion(model.Suggestion{
			Title:       ChangeClientIDTitle,
			Description: fmt.Sprintf(ChangeClientIDDescription, clientId),
			Icon:        constants.GetIconAddress(constants.IconPlus),
			ID:          "change-spotify-client-Id",
			Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
				SetCurrentCommandParameters: newClientIdParams,
			}).WithPromptState(&model.PromptState{
				SetPromptText: &clientId,
			}).Build(),
		})
	}

	newClientSecretParams := make(map[string]string)
	for key, value := range parameters {
		newClientSecretParams[key] = value
	}
	newClientSecretParams["selected-menu"] = "client_secret"

	if clientSecret == "" {
		slb.AddSuggestion(model.Suggestion{
			Title:       AddSpotifyClientSecretTitle,
			Description: AddSpotifyClientSecretDescription,
			Icon:        constants.GetIconAddress(constants.IconPlus),
			ID:          "add-spotify-client-secret",
			Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
				SetCurrentCommandParameters: newClientSecretParams,
			}).Build(),
		})
	} else {
		slb.AddSuggestion(model.Suggestion{
			Title:       ChangeClientSecretTitle,
			Description: fmt.Sprintf(ChangeClientSecretDescription, clientSecret),
			Icon:        constants.GetIconAddress(constants.IconPlus),
			ID:          "change-spotify-client-secret",
			Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
				SetCurrentCommandParameters: newClientSecretParams,
			}).WithPromptState(&model.PromptState{
				SetPromptText: &clientSecret,
			}).Build(),
		})
	}

	authParameters := map[string]string{"client_id": clientId, "client_secret": clientSecret}
	slb.AddSuggestion(model.Suggestion{
		Title:       AuthenticateWithSpotifyTitle,
		Description: AuthenticateWithSpotifyDescription,
		Icon:        constants.GetIconAddress(constants.IconAuthenticate),
		ID:          "authenticate-spotify",
		Action: builders.NewActionBuilder().WithExecuteAction(&model.ExecuteAction{
			CommandId:           "authenticate",
			ExecutionParameters: authParameters,
			WaitTillComplete:    true,
		}).Build(),
	})

	return *slb.Build()
}

func getClientIdSuggestions(input string, parameters map[string]string) model.SuggestionList {
	slb := builders.NewSuggestionListBuilder()

	parameters["selected-menu"] = ""

	newClientIdParams := make(map[string]string)

	for key, value := range parameters {
		newClientIdParams[key] = value
	}

	newClientIdParams["client_id"] = input
	slb.AddSuggestion(model.Suggestion{
		Title:       InputClientIDTitle,
		Description: fmt.Sprintf(InputClientIDDescription, input),
		Icon:        constants.GetIconAddress(constants.IconPlus),
		ID:          "add-spotify-client-id-field",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCurrentCommandParameters: newClientIdParams,
		}).Build(),
	})

	slb.AddSuggestion(model.Suggestion{
		Title:       BackTitle,
		Description: BackDescription,
		Icon:        constants.GetIconAddress(constants.IconBackNav),
		ID:          "back-to-main-menu",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCurrentCommandParameters: parameters,
		}).Build(),
	})

	return *slb.Build()
}

func getClientSecretSuggestions(input string, parameters map[string]string) model.SuggestionList {
	slb := builders.NewSuggestionListBuilder()

	parameters["selected-menu"] = ""

	newClientSecretParams := make(map[string]string)

	for key, value := range parameters {
		newClientSecretParams[key] = value
	}

	newClientSecretParams["client_secret"] = input
	slb.AddSuggestion(model.Suggestion{
		Title:       InputClientSecretTitle,
		Description: fmt.Sprintf(InputClientSecretDescription, input),
		Icon:        constants.GetIconAddress(constants.IconPlus),
		ID:          "add-spotify-client-secret-field",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCurrentCommandParameters: newClientSecretParams,
		}).Build(),
	})

	slb.AddSuggestion(model.Suggestion{
		Title:       BackTitle,
		Description: BackDescription,
		Icon:        constants.GetIconAddress(constants.IconBackNav),
		ID:          "back-to-main-menu",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCurrentCommandParameters: parameters,
		}).Build(),
	})

	return *slb.Build()
}

func (c *authenticateCommand) GetPlaceholderSuggestion() model.Suggestion {
	return model.Suggestion{
		Title:       AuthenticatePlaceholderTitle,
		Description: AuthenticatePlaceholderDescription,
		Icon:        constants.GetIconAddress(constants.IconAuthenticate),
		ID:          "authenticate-spotify",
		Action: builders.NewActionBuilder().WithCommandOptions(&model.CommandOptions{
			SetCommand: &model.Command{
				ID:         commandModel.ID,
				Properties: commandModel.Properties,
			},
		}).Build(),
	}
}

func RegisterAuthCommand(commandManager *command.Manager, spotifyHolder *spotify.SpotifyClientHolder, config authConfig) {
	authenticateCommand := &authenticateCommand{config: config, urlOpener: browser.OpenURL}
	commandManager.RegisterCommandKeyword(commandModel.TriggerWord, authenticateCommand)
	commandManager.RegisterCommand(commandModel.ID, authenticateCommand)
}
