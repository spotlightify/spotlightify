package main

import (
	"log"
	"net/http"

	"github.com/spf13/afero"
	"github.com/spotlightify/spotlightify/configs"
	"github.com/spotlightify/spotlightify/internal/cache"
	"github.com/spotlightify/spotlightify/internal/command"
	"github.com/spotlightify/spotlightify/internal/command/play"
	"github.com/spotlightify/spotlightify/internal/spotify"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	v1 "github.com/spotlightify/spotlightify/api/v1"
)

type managers struct {
	commandManager *command.Manager
	spotifyHolder  *spotify.SpotifyClientHolder
	cacheManager   *cache.CacheManager
}

func registerCommands(managers managers) {
	play.RegisterPlayCommand(managers.commandManager, managers.spotifyHolder, managers.cacheManager)
}

func main() {
	port := ":5121"

	spotify := spotify.NewSpotifyClientHolder()
	commandManager := command.NewManager()
	cacheManager := cache.NewCacheManager()

	registerCommands(managers{
		commandManager: commandManager,
		spotifyHolder:  spotify,
		cacheManager:   cacheManager,
	})

	fileSystem := afero.NewOsFs()
	config := configs.InitialiseConfig(fileSystem)

	router := mux.NewRouter()

	v1.SetupCommandRoutes(router, &v1.CommandHandler{Config: config, CommandManager: commandManager})
	v1.SetupAuthenticationRoutes(router, &v1.AuthenticationHandlers{Config: config})

	// TODO implement websocket handler
	// router.HandleFunc("/ws", api.HandleConnections)

	headersOk := handlers.AllowedHeaders([]string{"Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"*"}) // TODO: restrict to specific origin of electron server
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	log.Println("Starting server on " + port + "...")
	log.Fatal(http.ListenAndServe(port, handlers.CORS(originsOk, headersOk, methodsOk)(router)))
}
