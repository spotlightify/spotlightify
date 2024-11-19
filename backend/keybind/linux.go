//go:build linux

package keybind

import (
	"golang.design/x/hotkey"
)

func GetHotkey() *hotkey.Hotkey {
	return hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.Mod1}, hotkey.KeySpace)
}
