package platform

import (
	"context"

	"golang.design/x/hotkey"
)

// Interface for OS-specific functions
type OSOperations interface {
	GetHotkey() *hotkey.Hotkey
	ShowWindow(ctx context.Context)
}

// GetOSOperations returns the OS-specific implementation
func GetOSOperations() OSOperations {
	return osSpecificOperations{}
}
