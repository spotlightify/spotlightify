package main

import (
	"embed"
	"log/slog"
	"spotlightify-wails/backend"

	"os"
	"strings"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	backend := backend.CreateBackend()

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

	app := application.New(application.Options{
		Name: "Spotlightify",
		Services: []application.Service{
			application.NewService(backend),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	spotlightifyWindow := app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Title:       "Spotlightify",
		AlwaysOnTop: true,
		Name:        "Spotlightify",
		Frameless:   true,

		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 0,
			Backdrop:                application.MacBackdropTransparent,
			WindowLevel:             application.MacWindowLevelPopUpMenu,
		},
		URL: "/",
	})

	backend.StartBackend(app, spotlightifyWindow)

	err := app.Run()
	if err != nil {
		slog.Error(err.Error())
	}
}
