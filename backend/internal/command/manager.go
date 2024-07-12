package command

import (
	"sync"

	"spotlightify-wails/backend/internal/interfaces"
)

// type CommandManager interface {
// 	RegisterCommand(commandId string, command interfaces.Command)
// 	RegisterCommandKeyword(keyword string, command interfaces.Command)
// 	GetCommandById(commandId string) interfaces.Command
// 	FindCommands(search string) []interfaces.Command
// }

type RouteManager struct {
	commandMap map[string]interfaces.Command
	mu         *sync.RWMutex
}

func (r RouteManager) RegisterRoute(path string, command interfaces.Command) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.commandMap[path] = command
}

func (r RouteManager) GetCommand(path string) (interfaces.Command, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	command, ok := r.commandMap[path]
	return command, ok
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

func (m *Manager) GetCommandById(commandId string) (interfaces.Command, bool) {
	return m.routes.GetCommand(commandId)
}

func (m *Manager) FindCommands(search string) []interfaces.Command {
	return m.keywordRegistry.FindItems(search)
}

func NewManager() *Manager {
	return &Manager{
		routes:          &RouteManager{make(map[string]interfaces.Command), &sync.RWMutex{}},
		keywordRegistry: &Registry{},
	}
}
