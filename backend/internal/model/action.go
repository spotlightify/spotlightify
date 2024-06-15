package model

type ExecutionParameters map[string]string

type ExecuteAction struct {
	CommandId           string              `json:"commandId"`
	ExecutionParameters ExecutionParameters `json:"data"`
	WaitTillComplete    bool                `json:"waitTillComplete"`
	CloseOnSuccess      bool                `json:"closeOnSuccess"`
}

type PushCommand struct {
	Id         string            `json:"id"`
	Parameters CommandParameters `json:"parameters,omitempty"`
	Properties CommandProperties `json:"properties"`
}

type SetCommand struct {
	Id         string            `json:"id"`
	Parameters CommandParameters `json:"parameters"`
	Properties CommandProperties `json:"properties"`
}

type CommandOptions struct {
	PushCommand                 *PushCommand       `json:"pushCommand,omitempty"`
	SetCommand                  *SetCommand        `json:"setCommand,omitempty"`
	SetCurrentCommandParameters *CommandParameters `json:"setCurrentCommandParameters,omitempty"`
	PopCommand                  bool               `json:"popCommand"`
	ClearCommandStack           bool               `json:"clearCommandStack"`
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
