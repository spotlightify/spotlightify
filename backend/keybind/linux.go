//go:build linux

package keybind

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.design/x/hotkey"
)

func GetHotkey() *hotkey.Hotkey {
	return hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.Mod1}, hotkey.KeySpace)
}

func ShowWindow(ctx context.Context) {
	runtime.WindowShow(ctx)
}
