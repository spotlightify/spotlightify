package server

import (
	"context"
	"log/slog"
	"net/http"
	"spotlightify-wails/backend/configs"
	"spotlightify-wails/backend/internal/constants"
	spot "spotlightify-wails/backend/internal/spotify"

	"github.com/gorilla/mux"
)

type AuthServer struct {
	server    *http.Server
	isRunning bool
}

func (a *AuthServer) StartAuthServer(wailsContext context.Context, config *configs.SpotlightifyConfig, clientHolder *spot.SpotifyClientHolder) {
	// TODO We need to check if the server is already running
	if a.isRunning {
		slog.Info("Server is running")
		return
	}

	router := mux.NewRouter()

	slog.Info("Starting auth server on port", "port", constants.Port)

	a.server = &http.Server{
		Addr:    constants.Port,
		Handler: router,
	}

	SetupAuthenticationRoutes(router, &AuthenticationHandlers{
		Config:         config,
		ClientHolder:   clientHolder,
		ShutdownServer: a.server.Shutdown,
		WailsContext:   wailsContext,
	})

	go serve(a.server)
}

func serve(server *http.Server) {
	err := server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		slog.Error("Error starting auth server", "error", err)
	}
}

func (a *AuthServer) StopAuthServer() {
	if a.server == nil {
		slog.Error("Could not close server as pointer is nil")
		return
	}

	err := a.server.Shutdown(context.Background())
	if err != nil {
		slog.Error("Error stopping auth server", "error", err)
	}
	slog.Info("Auth server stopped")
}
