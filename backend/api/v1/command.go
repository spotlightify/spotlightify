package v1

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/spotlightify/spotlightify/configs"
	cmd "github.com/spotlightify/spotlightify/internal/command"
	"github.com/spotlightify/spotlightify/internal/model"
	"github.com/spotlightify/spotlightify/internal/utils"
)

const (
	commandIdSegment = "commandId"
)

func SetupCommandRoutes(r *mux.Router, handlers *CommandHandler) {
	r.HandleFunc("/command", handlers.handleKeywordSearch)
	r.HandleFunc("/command/{command_id}/get-suggestions", handlers.handleCommandSuggestions)
	r.HandleFunc("/command/{command_id}/action", handlers.handleCommandAction)
}

type CommandHandler struct {
	Config         *configs.SpotlightifyConfig
	CommandManager *cmd.Manager
}

func (c *CommandHandler) handleCommandSuggestions(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commandId := vars["command_id"]
	command := c.CommandManager.GetCommandById(commandId)

	parameters := utils.SingleValueQuery(r.URL.Query())
	input := parameters["input"]

	suggestions := command.GetSuggestions(input, parameters, r.Context())

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(suggestions)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *CommandHandler) handleCommandAction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	commandId := vars["command_id"]
	command := c.CommandManager.GetCommandById(commandId)
	parameters := utils.SingleValueQuery(r.URL.Query())

	executeOutput := command.Execute(parameters, r.Context())

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(executeOutput)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *CommandHandler) handleKeywordSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	search := query.Get("search")
	if search == "" {
		encodeEmptySuggestionList(w)
		return
	}
	var suggestions []model.Suggestion

	foundCommands := c.CommandManager.FindCommands(search)
	if len(foundCommands) == 0 {
		encodeEmptySuggestionList(w)
		return
	}

	for _, c := range foundCommands {
		suggestions = append(suggestions, c.GetPlaceholderSuggestion())
	}

	w.Header().Set("Content-Type", "application/json")
	err := utils.EncodeJson(w, model.SuggestionList{
		Items:  suggestions,
		Filter: false,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func encodeEmptySuggestionList(w http.ResponseWriter) {
	err := utils.EncodeJson(w, model.SuggestionList{
		Items:  []model.Suggestion{},
		Filter: false,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
