package windows

import (
	"runtime"
	"syscall"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	user32           = syscall.NewLazyDLL("user32.dll")
	getWindowLongPtr = user32.NewProc("GetWindowLongPtrW")
	setWindowLongPtr = user32.NewProc("SetWindowLongPtrW")
	showWindow       = user32.NewProc("ShowWindow")
)

const (
	GWL_EXSTYLE      = -20
	WS_EX_APPWINDOW  = 0x00040000
	WS_EX_TOOLWINDOW = 0x00000080
	SW_HIDE          = 0
	SW_SHOW          = 5
)

func getHWND(r runtime.Window) uintptr {
	// Platform-specific method to get HWND
	// Implementation may vary based on Wails version
	// Example for Wails v2 with windows
	return uintptr(r.Context().Window().Handle())
}
