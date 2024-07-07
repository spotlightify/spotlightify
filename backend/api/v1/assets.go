package v1

import (
	"embed"
	"log"
	"net/http"

	_ "embed"

	"github.com/gorilla/mux"
	"github.com/spf13/afero"
	"github.com/spotlightify/spotlightify/internal/utils"
)

//go:embed icons/*
var icons embed.FS

type loggingHandler struct {
	handler http.Handler
}

func (h loggingHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	log.Println("Serving asset: ", r.URL.Path)
	h.handler.ServeHTTP(w, r)
}

func LoggingMiddleware(h http.Handler) http.Handler {
	return loggingHandler{h}
}

func SetupAssetRoutes(r *mux.Router, fs afero.Fs) {
	log.Println("Setting up asset routes")
	assetsRouter := r.PathPrefix("/assets/").Subrouter()
	assetsRouter.PathPrefix("/icons/").Handler(LoggingMiddleware(http.StripPrefix("/assets/", http.FileServer(http.FS(icons)))))
	localArtDir, err := utils.GetArtDir(utils.RealEnvironment{})
	if err != nil {
		log.Println("Error getting art directory: ", err)
		log.Println("Creating art directory")
		fs.MkdirAll(localArtDir, 0755)
	}

	assetsRouter.PathPrefix("/art/").Handler(http.StripPrefix("/assets/art/", http.FileServer(http.Dir(localArtDir))))
	log.Println("Finished setting up asset routes")
}
