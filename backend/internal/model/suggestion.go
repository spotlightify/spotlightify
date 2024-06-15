package model

type Suggestion struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Icon        string  `json:"icon"`
	ID          string  `json:"id"` // unique id for the suggestion, used in frontend to track the suggestion (React)
	Action      *Action `json:"action"`
}

type SuggestionList struct {
	Items []Suggestion `json:"items"`
	// Static and Filter are mutually exclusive, if both are erroneously set, Filter will take precedence
	Filter        bool `json:"filter"`
	Static        bool `json:"static"`
	ErrorOccurred bool `json:"errorOccurred"`
}
