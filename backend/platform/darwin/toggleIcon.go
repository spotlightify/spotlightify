package darwin

// #cgo CFLAGS: -x objective-c
// #cgo LDFLAGS: -framework Cocoa
// #import <Cocoa/Cocoa.h>
// void toggleDockIcon(bool show) {
//     if (show) {
//         [[NSApplication sharedApplication] setActivationPolicy:NSApplicationActivationPolicyRegular];
//     } else {
//         [[NSApplication sharedApplication] setActivationPolicy:NSApplicationActivationPolicyAccessory];
//     }
// }
import "C"

// ToggleDockIcon shows or hides the application icon in the Dock
func ToggleDockIcon(show bool) {
	C.toggleDockIcon(C.bool(show))
}
