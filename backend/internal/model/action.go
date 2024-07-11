package model

type ExecuteAction struct {
	CommandId           string            `json:"commandId"`
	ExecutionParameters map[string]string `json:"parameters"`
	WaitTillComplete    bool              `json:"waitTillComplete"`
	CloseOnSuccess      bool              `json:"closeOnSuccess"`
}

type Command struct {
	Id         string            `json:"id"`
	Parameters map[string]string `json:"parameters,omitempty"`
	Properties CommandProperties `json:"properties"`
	PromptText string            `json:"promptText,omitempty"`
}

type CommandOptions struct {
	PushCommand                 *Command          `json:"pushCommand,omitempty"`
	SetCommand                  *Command          `json:"setCommand,omitempty"`
	SetCurrentCommandParameters map[string]string `json:"setCurrentCommandParameters,omitempty"`
	PopCommand                  bool              `json:"popCommand"`
	ClearCommandStack           bool              `json:"clearCommandStack"`
}

type PromptState struct {
	ClosePrompt        *bool   `json:"closePrompt,omitempty"`
	SetPromptText      *string `json:"setPromptText,omitempty"`
	PreservePromptText *bool   `json:"preservePromptText,omitempty"`
	FreezePrompt       *bool   `json:"freezePrompt,omitempty"`
}

type Action struct {
	CommandOptions *CommandOptions `json:"commandOptions,omitempty"`
	PromptState    *PromptState    `json:"promptState,omitempty"`
	ExecuteAction  *ExecuteAction  `json:"executeAction,omitempty"`
}

type ExecuteActionOutput struct {
	Action      *Action         `json:"action,omitempty"`      // Action side effect
	Suggestions *SuggestionList `json:"suggestions,omitempty"` // SuggestionList side effect
}

// Output represents the response sent back to the client.
type Output struct {
	ErrorTitle       string  `json:"errorTitle"`
	ErrorDescription string  `json:"errorDescription"`
	ErrorAction      *Action `json:"errorAction,omitempty"`
}
