package backend

import (
	"context"
	"log"
	"log/slog"
	"spotlightify-wails/backend/configs"
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/cache"
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/authenticate"
	"spotlightify-wails/backend/internal/command/device"
	"spotlightify-wails/backend/internal/command/playOnline"
	"spotlightify-wails/backend/internal/command/playlistOnline"
	"spotlightify-wails/backend/internal/model"
	"spotlightify-wails/backend/internal/spotify"
	"strings"

	"github.com/spf13/afero"
)

type managers struct {
	commandManager *command.Manager
	spotifyHolder  *spotify.SpotifyClientHolder
	cacheManager   *cache.CacheManager
	config         *configs.SpotlightifyConfig
}

func registerCommands(managers *managers) {
	playOnline.RegisterPlayOnlineCommand(managers.commandManager, managers.spotifyHolder)
	playlistOnline.RegisterPlaylistOnlineCommand(managers.commandManager, managers.spotifyHolder)
	authenticate.RegisterAuthCommand(managers.commandManager, managers.spotifyHolder, managers.config)
	device.RegisterDeviceCommand(managers.commandManager, managers.spotifyHolder, managers.config)
}

type Backend struct {
	managers *managers
}

func (b *Backend) getCommandsByKeyword(search string) model.SuggestionList {
	commands := b.managers.commandManager.FindCommands(search)
	slb := builders.NewSuggestionListBuilder()

	for _, command := range commands {
		slb.AddSuggestion(command.GetPlaceholderSuggestion())
	}

	return *slb.Build()
}

func (b *Backend) GetSuggestions(input string, commandId string, parameters map[string]string) model.SuggestionList {
	slog.Info("Getting suggestions", "command", commandId, "input", input, "parameters", parameters)
	ctx := context.Background()
	if commandId == "" && input == "" {
		return model.SuggestionList{Items: []model.Suggestion{}}
	}

	input = strings.ToLower(input)
	if commandId == "" {
		return b.getCommandsByKeyword(input)
	}

	command, ok := b.managers.commandManager.GetCommandById(commandId)
	if !ok {
		slog.Warn("Command with id %s not found", commandId)
		return model.SuggestionList{Items: []model.Suggestion{}}
	}

	return command.GetSuggestions(input, parameters, ctx)
}

func (b *Backend) ExecuteCommand(commandId string, parameters map[string]string) model.ExecuteActionOutput {
	slog.Info("Executing command", "command", commandId, "parameters", parameters)
	ctx := context.Background()
	command, ok := b.managers.commandManager.GetCommandById(commandId)
	if !ok {
		log.Printf("Command with id %s not found", commandId)
		return model.ExecuteActionOutput{}
	}

	return command.Execute(parameters, ctx)
}

func StartBackend() *Backend {
	fileSystem := afero.NewOsFs()
	setupDirectories(fileSystem) // TODO

	config := configs.InitialiseConfig(fileSystem)

	spotify := spotify.NewSpotifyClientHolder(config)
	err := spotify.LoadSpotifyTokenFromConfig(config)
	if err != nil {
		log.Fatalf("Failed to load Spotify token from config: %v", err)
	}
	commandManager := command.NewManager()
	cacheManager := cache.NewCacheManager()

	managers := &managers{
		commandManager: commandManager,
		spotifyHolder:  spotify,
		cacheManager:   cacheManager,
		config:         config,
	}

	registerCommands(managers)

	backend := &Backend{
		managers: managers,
	}

	// router := mux.NewRouter()

	// v1.SetupCommandRoutes(router, &v1.CommandHandler{Config: config, CommandManager: commandManager})
	// v1.SetupAuthenticationRoutes(router, &v1.AuthenticationHandlers{Config: config, ClientHolder: spotify})
	// v1.SetupAssetRoutes(router, fileSystem)

	// headersOk := handlers.AllowedHeaders([]string{"Content-Type"})
	// originsOk := handlers.AllowedOrigins([]string{"*"}) // TODO: restrict to specific origin of electron server
	// methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	// log.Println("Starting server on " + constants.ServerURL + "...")
	// log.Fatal(http.ListenAndServe(constants.Port, handlers.CORS(originsOk, headersOk, methodsOk)(router)))
	return backend
}
