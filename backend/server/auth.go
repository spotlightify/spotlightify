package server

import "github.com/gorilla/mux"

type AuthServer struct {
	managers *managers
}

func (a *AuthServer) StartServer() {
	router := mux.NewRouter()

	SetupAuthenticationRoutes(router, &AuthenticationHandlers{)

}
