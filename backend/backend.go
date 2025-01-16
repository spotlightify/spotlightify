package backend

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"spotlightify-wails/backend/configs"
	"spotlightify-wails/backend/constants"
	"spotlightify-wails/backend/internal/spotify"
	"spotlightify-wails/backend/keybind"
	"spotlightify-wails/backend/server"

	"github.com/spf13/afero"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.design/x/hotkey"
)

type managers struct {
	spotifyHolder *spotify.SpotifyClientHolder
	config        *configs.SpotlightifyConfig
}

type Backend struct {
	managers   *managers
	ctx        context.Context
	authServer *server.AuthServer
	version    string
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

func StartBackend(version string) *Backend {
	fileSystem := afero.NewOsFs()
	setupDirectories(fileSystem) // TODO

	config := configs.InitialiseConfig(fileSystem)

	spotify := spotify.NewSpotifyClientHolder(config)
	err := spotify.LoadSpotifyTokenFromConfig(config)
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to load Spotify token from config: %v", err))
	}

	managers := &managers{
		spotifyHolder: spotify,
		config:        config,
	}

	backend := &Backend{
		managers:   managers,
		authServer: &server.AuthServer{},
		version:    version,
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

func (b *Backend) GetVersion() string {
	return b.version
}
