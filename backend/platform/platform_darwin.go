//go:build darwin
// +build darwin

package platform

import (
	"context"
	"spotlightify-wails/backend/platform/darwin"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.design/x/hotkey"
)

type osSpecificOperations struct{}

func (o osSpecificOperations) GetHotkey() *hotkey.Hotkey {
	o.ToggleDockIcon(false)
	return hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModOption}, hotkey.KeySpace)
}

func (o osSpecificOperations) ShowWindow(ctx context.Context) {
	runtime.WindowShow(ctx)
}

func (o osSpecificOperations) ToggleDockIcon(show bool) {
	darwin.ToggleDockIcon(show)
}
