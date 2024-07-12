package main

import (
	"embed"
	"spotlightify-wails/backend"

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

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "Spotlightify",
		Width:            650,
		Height:           66,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Frameless:        true,
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  false,
		},

		Mac: &mac.Options{
			WebviewIsTransparent: true,
		},
		Linux: &linux.Options{
			WindowIsTranslucent: true, // TODO Test this
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
