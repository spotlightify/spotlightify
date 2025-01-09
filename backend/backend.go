package backend

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"spotlightify-wails/backend/configs"
	"spotlightify-wails/backend/constants"
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
	"spotlightify-wails/backend/keybind"
	"spotlightify-wails/backend/server"
	"strings"

	"github.com/spf13/afero"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.design/x/hotkey"
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
	managers   *managers
	ctx        context.Context
	authServer *server.AuthServer
}

func (a *Backend) Startup(ctx context.Context) {
	a.ctx = ctx
	hk := keybind.GetHotkey()
	err := hk.Register()
	if err != nil {
		log.Printf("Failed to register hotkey: %v", err)
	}
	go listenForHotkey(ctx, hk)
	a.ShowWindow()
}

// Expose the ShowWindow function to the frontend
func (a *Backend) ShowWindow() {
	showWindow(a.ctx)
}

func listenForHotkey(ctx context.Context, hk *hotkey.Hotkey) {
	for range hk.Keydown() {
		slog.Info("Hotkey pressed")
		showWindow(ctx)
	}
}

func defaultShowWindow(ctx context.Context) {
	keybind.ShowWindow(ctx)
	runtime.WindowCenter(ctx)
}

func showWindow(ctx context.Context) {
	screens, err := runtime.ScreenGetAll(ctx)
	if err != nil {
		slog.Error("Failed to get screens", "error", err)
		defaultShowWindow(ctx)
		return
	}

	currentScreenIndex := -1
	for idx, screen := range screens {
		if screen.IsCurrent {
			currentScreenIndex = idx
			break
		}
	}

	if currentScreenIndex == -1 {
		slog.Error("Failed to find current screen")
		defaultShowWindow(ctx)
		return
	}

	currentScreen := screens[currentScreenIndex]
	posX := (currentScreen.Size.Width - constants.Width) / 2
	posY := currentScreen.Size.Height / 5
	keybind.ShowWindow(ctx)
	runtime.WindowSetPosition(ctx, posX, posY)
	slog.Info("Setting window position", "x", posX, "y", posY)
}

// domReady is called after front-end resources have been loaded
func (a *Backend) DomReady(ctx context.Context) {
	a.ctx = ctx
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
		slog.Error(fmt.Sprintf("Failed to load Spotify token from config: %v", err))
	}
	commandRegistry := command.NewRegistry()
	cacheManager := cache.NewCacheManager()

	managers := &managers{
		commandRegistry: commandRegistry,
		spotifyHolder:   spotify,
		cacheManager:    cacheManager,
		config:          config,
	}

	backend := &Backend{
		managers:   managers,
		authServer: &server.AuthServer{},
	}

	// This makes any playback commands use the active device when the app starts
	// Spotlightify should be used to set the active device after this
	device, err := backend.GetActiveDevice()
	if err != nil {
		slog.Error("Failed to get active device", "error", err)
		managers.config.SetActiveDevice("")
	} else {
		managers.config.SetActiveDevice(device.ID.String())
	}

	return backend
}
