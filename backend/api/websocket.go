package api

// TODO implement websocket handler

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	cmd "github.com/spotlightify/spotlightify/internal/command"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer func(ws *websocket.Conn) {
		err := ws.Close()
		if err != nil {
			log.Println("Failed to close websocket")
		}
	}(ws)

	for {
		var msg map[string]interface{}
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("errorCmd: %v", err)
			break
		}
		handleMessage(ws, msg)
	}
}

func handleMessage(ws *websocket.Conn, msg map[string]interface{}) {
	switch msg["type"] {
	case "get-suggestio":
		input := msg["input"].(string)
		parameters := msg["parameters"].(map[string]string)

		commandId := msg["commandId"].(string)
		command := cmd.GlobalCommandManager.GetCommandById(commandId)

		suggestionList := command.GetSuggestions(input, parameters)

		response := map[string]interface{}{
			"type": "suggestions",
			"data": suggestionList,
		}
		err := ws.WriteJSON(response)
		if err != nil {
			log.Printf("Error: Failed to write SuggestionList JSON")
			return
		}
	case "action":
		parameters := msg["parameters"].(map[string]string)

		commandId := msg["commandId"].(string)
		command := cmd.GlobalCommandManager.GetCommandById(commandId)

		actionResponse := command.Execute(parameters)
		response := map[string]interface{}{
			"type": "action_response",
			"data": actionResponse,
		}
		err := ws.WriteJSON(response)
		if err != nil {
			log.Printf("Error: Failed to write action response JSON")
			return
		}
	// Add cases for other message types if needed
	default:
		log.Println("Unknown message type:", msg["type"])
	}
}
