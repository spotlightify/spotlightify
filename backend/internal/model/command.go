package model

type Command struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`        // Text to show on the command's placeholder suggestion
	Description string            `json:"description"` // Text to show on the command's placeholder suggestion
	Icon        string            `json:"icon"`        // Icon to show on the command's placeholder suggestion
	TriggerWord string            `json:"triggerWord"` // The word that triggers this command
	Parameters  map[string]string `json:"parameters,omitempty"`
	Properties  CommandProperties `json:"properties"`
	PromptText  string            `json:"promptText,omitempty"` // Used in frontend to hold prompt text, not needed in backend
}

type CommandProperties struct {
	Title           string `json:"title"`          // The string which appears on the UI when the command is selected
	ShorthandTitle  string `json:"shorthandTitle"` // The string which appears on the UI when this command is in the command stack, should be one character
	DebounceMS      int    `json:"debounceMS"`
	KeepPromptOpen  bool   `json:"keepPromptOpen"`  // Controls whether the prompt should be kept open while this is the active command, i.e. the prompt won't close on window blur
	PlaceholderText string `json:"placeholderText"` // The string which appears in the prompt when this command is selected
}
