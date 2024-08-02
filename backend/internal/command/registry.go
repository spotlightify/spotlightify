package command

import (
	"fmt"
	"spotlightify-wails/backend/internal/interfaces"
	"spotlightify-wails/backend/internal/model"
	"strings"

	"golang.org/x/exp/slices"
)

type Registry struct {
	CommandIDMap      map[model.CommandID]interfaces.Command
	CommandKeywordMap map[model.CommandKeyword]interfaces.Command
}

func (r Registry) Register(id model.CommandID, keyword model.CommandKeyword, cmd interfaces.Command) {
	r.CommandIDMap[id] = cmd
	if keyword != "" {
		r.CommandKeywordMap[keyword] = cmd
	}
}

func (r Registry) GetItemByID(id model.CommandID) (interfaces.Command, error) {
	if cmd, ok := r.CommandIDMap[id]; ok {
		return cmd, nil
	}
	return nil, fmt.Errorf("command not found")
}

func (r Registry) GetItemByKeyword(keyword model.CommandKeyword) (interfaces.Command, error) {
	if cmd, ok := r.CommandKeywordMap[keyword]; ok {
		return cmd, nil
	}
	return nil, fmt.Errorf("command not found")
}

func (r Registry) FindItemsByKeyword(searchWord string) []interfaces.Command { // TODO implement a more efficient search
	var foundKeywords []string
	for keyword := range r.CommandKeywordMap {
		if strings.HasPrefix(string(keyword), searchWord) {
			foundKeywords = append(foundKeywords, string(keyword))
		}
	}

	slices.Sort(foundKeywords)

	var foundCommands []interfaces.Command
	for _, keyword := range foundKeywords {
		foundCommands = append(foundCommands, r.CommandKeywordMap[model.CommandKeyword(keyword)])
	}

	return foundCommands
}

func NewRegistry() *Registry {
	return &Registry{
		CommandIDMap:      make(map[model.CommandID]interfaces.Command),
		CommandKeywordMap: make(map[model.CommandKeyword]interfaces.Command),
	}
}
