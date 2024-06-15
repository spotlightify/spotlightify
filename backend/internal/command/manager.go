package command

import (
	"github.com/spotlightify/spotlightify/internal/interfaces"
)

var GlobalCommandManager = NewManager()

type RouteManager map[string]interfaces.Command

func (r RouteManager) RegisterRoute(path string, command interfaces.Command) {
	r[path] = command
}

func (r RouteManager) GetCommand(path string) interfaces.Command {
	return r[path]
}

// Manager Manages commands and subcommands, and their routes
type Manager struct {
	routes          *RouteManager
	keywordRegistry *Registry
}

func (m *Manager) RegisterCommand(commandId string, command interfaces.Command) {
	m.routes.RegisterRoute(commandId, command)
}

func (m *Manager) RegisterCommandKeyword(keyword string, command interfaces.Command) {
	m.keywordRegistry.Register(keyword, command)
}

func (m *Manager) GetCommandById(commandId string) interfaces.Command {
	return m.routes.GetCommand(commandId)
}

func (m *Manager) FindCommands(search string) []interfaces.Command {
	return m.keywordRegistry.FindItems(search)
}

func NewManager() *Manager {
	return &Manager{
		routes:          &RouteManager{},
		keywordRegistry: &Registry{},
	}
}
