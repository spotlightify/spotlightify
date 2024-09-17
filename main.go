package main

import (
	"embed"
	"log/slog"
	"spotlightify-wails/backend"
	"spotlightify-wails/backend/constants"

	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	app := NewApp()
	backend := backend.StartBackend()

	// Check for development mode
	isDev := strings.ToLower(os.Getenv("SPOTLIGHTIFY_DEV")) == "true"
	if isDev {
		slog.Info("Running in development mode")
	}

	// Create application with options
	err := wails.Run(&options.App{
		Title:             "Spotlightify",
		Width:             constants.Width,
		Height:            constants.Height,
		AlwaysOnTop:       true,
		DisableResize:     true,
		HideWindowOnClose: true,
		Assets:            assets,
		BackgroundColour:  &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:         backend.Startup,
		OnDomReady:        backend.DomReady,
		Frameless:         true,
		StartHidden:       isDev,

		// OS specific options
		Windows: &windows.Options{
			WebviewIsTransparent: true,
		},
		Mac: &mac.Options{
			WebviewIsTransparent: true,
		},
		Linux: &linux.Options{
			WindowIsTranslucent: true,
			WebviewGpuPolicy:    linux.WebviewGpuPolicyNever,
		},

		Bind: []interface{}{
			app,
			backend,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
