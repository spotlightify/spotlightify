package main

import (
	"log"
	"net/http"

	"github.com/spotlightify/spotlightify/internal/command/play"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	v1 "github.com/spotlightify/spotlightify/api/v1"
)

func registerCommands() {
	play.RegisterPlayCommand()
}

func main() {
	// TODO load config

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

	log.Println("Starting server on :5000...")
	log.Fatal(http.ListenAndServe(":5000", handlers.CORS(originsOk, headersOk, methodsOk)(router)))
}
