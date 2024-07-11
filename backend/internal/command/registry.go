package command

import (
	"fmt"
	"spotlightify-wails/backend/internal/interfaces"
	"strings"
)

type Registry map[string]interfaces.Command

func (r Registry) Register(keyword string, cmd interfaces.Command) {
	r[keyword] = cmd
}

func (r Registry) GetItem(id string) (interfaces.Command, error) {
	if cmd, ok := r[id]; ok {
		return cmd, nil
	}
	return nil, fmt.Errorf("command not found")
}

func (r Registry) FindItems(searchWord string) []interfaces.Command { // TODO implement a more efficient search
	var result []interfaces.Command
	for keyword, cmd := range r {
		if strings.HasPrefix(keyword, searchWord) {
			result = append(result, cmd)
		}
	}
	return result
}

func newRegistry() Registry {
	return Registry{}
}
