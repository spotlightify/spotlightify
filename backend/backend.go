package backend

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"runtime"
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
	"spotlightify-wails/backend/keybind"
	"spotlightify-wails/backend/server"
	"strings"

	"github.com/spf13/afero"
	"github.com/wailsapp/wails/v3/pkg/application"
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
	managers           *managers
	ctx                context.Context
	authServer         *server.AuthServer
	app                *application.App
	spotlightifyWindow *application.WebviewWindow
}

func (b *Backend) StartBackend(app *application.App, window *application.WebviewWindow) {
	b.app = app
	b.spotlightifyWindow = window

	go b.createHotkey()
	// This makes any playback commands use the active device when the app starts
	// Spotlightify should be used to set the active device after this
	device, err := b.GetActiveDevice()
	if err != nil {
		slog.Error("Failed to get active device", "error", err)
		b.managers.config.SetActiveDevice("")
	} else {
		b.managers.config.SetActiveDevice(device.ID.String())
	}
}

func (a *Backend) createHotkey() {
	runtime.LockOSThread() // hotkey must be called from the main thread
	defer runtime.UnlockOSThread()
	// Register keybind
	hk := keybind.GetHotkey()
	if hk == nil {
		slog.Error("Failed to get hotkey")
	} else {
		err := hk.Register()
		if err != nil {
			slog.Error("Failed to register hotkey", "Error", err)
		}
	}

	if hk == nil {
		slog.Error("Hotkey did not register. Please report this issue on GitHub if it persists.")
	}
	go a.listenForHotkey(context.Background(), hk)
}

func (a *Backend) OnStartup(ctx context.Context, _ application.ServiceOptions) error {
	return nil
}

func (a *Backend) listenForHotkey(ctx context.Context, hk *hotkey.Hotkey) {
	slog.Info("Listening for hotkey")
	for range hk.Keydown() {
		if a.app == nil {
			slog.Error("Could not show window because app is nil")
			continue
		}
		slog.Info("Hotkey pressed")
		a.ShowWindow(ctx)
	}
}

func (a *Backend) ShowWindow(ctx context.Context) {
	a.spotlightifyWindow.Center()
	a.spotlightifyWindow.Show()
	a.spotlightifyWindow.Focus()
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

func CreateBackend() *Backend {
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
	return backend
}
