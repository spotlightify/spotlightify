package utils

import "strings"

// AppError represents a structured error that can be displayed on the frontend
type AppError struct {
	Command     string            `json:"command"`     // Optional command that can be executed to resolve the error
	Parameters  map[string]string `json:"parameters"`  // Optional parameters for the command
	Title       string            `json:"title"`       // Optional suggestion title
	Description string            `json:"description"` // Optional suggestion description
	Technical   string            `json:"technical"`   // Optional technical error message
	Icon        string            `json:"icon"`        // Optional icon to display
}

// Error implements the error interface
func (e AppError) Error() string {
	return e.Description
}

// Standard error for internal/unexpected errors, this should really never happen
func InternalError(err error) AppError {
	return AppError{
		Title:       "An internal error occurred",
		Description: "Please try again later or restart the application",
		Technical:   err.Error(),
	}
}

// CreateAppError creates an AppError from a regular error with appropriate defaults
func CreateAppError(err error) AppError {
	// Check if it's already our custom error type
	if appErr, ok := err.(AppError); ok {
		return appErr
	}

	// Default error handling
	switch {
	case strings.Contains(err.Error(), "token expired"):
		return AppError{
			Title:       "Your Spotify session has expired",
			Command:     "reauth",
			Description: "Click here to re-authenticate with Spotify",
		}
	case strings.Contains(err.Error(), "No active device found"):
		return AppError{
			Title:       "Select a device to control Spotify on",
			Command:     "device",
			Description: "Select the device which you want to control Spotify on",
			Icon:        "device",
		}
	case strings.Contains(err.Error(), "Restriction violated"):
		return AppError{
			Title:       "Action not allowed",
			Description: "This is likely due to spotify's state not allowing the action to be performed",
		}
	case strings.Contains(err.Error(), "Device not found"):
		return AppError{
			Title:       "Select a device to control Spotify on",
			Command:     "device",
			Description: "Select the device which you want to control Spotify on",
			Icon:        "device",
		}
	// Add more specific error cases as needed
	default:
		return AppError{
			Title:       "An unexpected error occurred",
			Description: err.Error(),
		}
	}
}
