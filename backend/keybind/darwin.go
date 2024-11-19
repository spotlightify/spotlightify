//go:build darwin

package keybind

import (
	"golang.design/x/hotkey"
)

func GetHotkey() *hotkey.Hotkey {
	return hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModOption}, hotkey.KeySpace)
}
