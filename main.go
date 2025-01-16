package main

import (
	"embed"
	"log/slog"
	"spotlightify-wails/backend"
	"spotlightify-wails/backend/constants"

	"os"
	"strings"

	"github.com/tidwall/gjson"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed wails.json
var wailsJson string

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func getVersion() string {
	var versionString = "0.1.0 beta"
	if wailsJson != "" {
		version := gjson.Get(wailsJson, "info.productVersion")
		if !version.Exists() {
			slog.Warn("Version not found in wails.json, using default")
		} else if version.String() == "" {
			slog.Warn("Empty version in wails.json, using default")
		} else {
			versionString = version.String() + " beta"
			slog.Info("Version: ", versionString)
		}
	}
	return versionString
}

func main() {
	// Create an instance of the app structure
	backend := backend.StartBackend(getVersion())

	// Check for development mode
	isDev := strings.ToLower(os.Getenv("SPOTLIGHTIFY_DEV")) == "true"
	if isDev {
		handler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug, // Set log level to Debug
		})

		// Set the default logger to use the custom handler
		slog.SetDefault(slog.New(handler))
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
		StartHidden:       true,
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
			backend,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
