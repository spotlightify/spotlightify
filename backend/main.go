package main

import (
	"log"
	"net/http"
	"os"

	"github.com/spotlightify/spotlightify/configs"
	"github.com/spotlightify/spotlightify/internal/command/play"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	v1 "github.com/spotlightify/spotlightify/api/v1"
)

func registerCommands() {
	play.RegisterPlayCommand()
}

func main() {
	var port string
	if len(os.Args) > 1 {
		port = ":" + os.Args[1]
	} else {
		port = ":5000"
	}

	configs.SetConfigValue(configs.ConfigServerUrlKey, "http://localhost"+port)

	// TODO connect to db

	registerCommands()

	router := mux.NewRouter()

	v1.SetupCommandRoutes(router)
	v1.SetupAuthenticationRoutes(router)

	// TODO implement websocket handler
	// router.HandleFunc("/ws", api.HandleConnections)

	headersOk := handlers.AllowedHeaders([]string{"Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"*"}) // TODO: restrict to specific origin of electron server
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	log.Println("Starting server on " + port + "...")
	log.Fatal(http.ListenAndServe(port, handlers.CORS(originsOk, headersOk, methodsOk)(router)))
}
