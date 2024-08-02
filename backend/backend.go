package backend

import (
	"context"
	"log"
	"log/slog"
	"spotlightify-wails/backend/configs"
	"spotlightify-wails/backend/internal/builders"
	"spotlightify-wails/backend/internal/cache"
	"spotlightify-wails/backend/internal/command"
	"spotlightify-wails/backend/internal/command/albumOnline"
	"spotlightify-wails/backend/internal/command/authenticate"
	"spotlightify-wails/backend/internal/command/device"
	"spotlightify-wails/backend/internal/command/episodeOnline"
	"spotlightify-wails/backend/internal/command/playOnline"
	"spotlightify-wails/backend/internal/command/playlistOnline"
	"spotlightify-wails/backend/internal/command/podcastOnline"
	"spotlightify-wails/backend/internal/command/queueOnline"
	"spotlightify-wails/backend/internal/model"
	"spotlightify-wails/backend/internal/spotify"
	"strings"

	"github.com/spf13/afero"
)

type managers struct {
	commandRegistry *command.Registry
	spotifyHolder   *spotify.SpotifyClientHolder
	cacheManager    *cache.CacheManager
	config          *configs.SpotlightifyConfig
}

func registerCommands(managers *managers) {
	playOnline.RegisterPlayOnlineCommand(managers.commandRegistry, managers.spotifyHolder)
	queueOnline.RegisterQueueOnlineCommand(managers.commandRegistry, managers.spotifyHolder)
	albumOnline.RegisterAlbumOnlineCommand(managers.commandRegistry, managers.spotifyHolder)
	playlistOnline.RegisterPlaylistOnlineCommand(managers.commandRegistry, managers.spotifyHolder)
	podcastOnline.RegisterPodcastOnlineCommand(managers.commandRegistry, managers.spotifyHolder)
	episodeOnline.RegisterEpisodeOnlineCommand(managers.commandRegistry, managers.spotifyHolder)

	authenticate.RegisterAuthCommand(managers.commandRegistry, managers.spotifyHolder, managers.config)
	device.RegisterDeviceCommand(managers.commandRegistry, managers.spotifyHolder, managers.config)
}

type Backend struct {
	managers *managers
}

func (b *Backend) getCommandsByKeyword(search string) model.SuggestionList {
	commands := b.managers.commandRegistry.FindItemsByKeyword(search)
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

	command, err := b.managers.commandRegistry.GetItemByID(model.CommandID(commandId))
	if err != nil {
		slog.Warn("Command with id %s not found", commandId)
		return model.SuggestionList{Items: []model.Suggestion{}}
	}

	return command.GetSuggestions(input, parameters, ctx)
}

func (b *Backend) ExecuteCommand(commandId string, parameters map[string]string) model.ExecuteActionOutput {
	slog.Info("Executing command", "command", commandId, "parameters", parameters)
	ctx := context.Background()
	command, error := b.managers.commandRegistry.GetItemByID(model.CommandID(commandId))
	if error != nil {
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
	commandRegistry := command.NewRegistry()
	cacheManager := cache.NewCacheManager()

	managers := &managers{
		commandRegistry: commandRegistry,
		spotifyHolder:   spotify,
		cacheManager:    cacheManager,
		config:          config,
	}

	registerCommands(managers)

	backend := &Backend{
		managers: managers,
	}

	// router := mux.NewRouter()

	// v1.SetupCommandRoutes(router, &v1.CommandHandler{Config: config, commandRegistry: commandRegistry})
	// v1.SetupAuthenticationRoutes(router, &v1.AuthenticationHandlers{Config: config, ClientHolder: spotify})
	// v1.SetupAssetRoutes(router, fileSystem)

	// headersOk := handlers.AllowedHeaders([]string{"Content-Type"})
	// originsOk := handlers.AllowedOrigins([]string{"*"}) // TODO: restrict to specific origin of electron server
	// methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	// log.Println("Starting server on " + constants.ServerURL + "...")
	// log.Fatal(http.ListenAndServe(constants.Port, handlers.CORS(originsOk, headersOk, methodsOk)(router)))
	return backend
}
