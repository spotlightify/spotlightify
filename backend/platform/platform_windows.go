//go:build windows
// +build windows

package platform

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.design/x/hotkey"
)

type osSpecificOperations struct{}

func (o osSpecificOperations) GetHotkey() *hotkey.Hotkey {
	return hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModAlt}, hotkey.KeySpace)
}

func (o osSpecificOperations) ShowWindow(ctx context.Context) {
	runtime.Show(ctx)
}
