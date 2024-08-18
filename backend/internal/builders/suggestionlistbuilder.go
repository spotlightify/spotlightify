package builders

import "spotlightify-wails/backend/internal/model"

type SuggestionListBuilder struct {
	suggestions  []model.Suggestion
	filter       bool
	static       bool
	errorOcurred bool
}

func (slb *SuggestionListBuilder) AddSuggestion(suggestion model.Suggestion) *SuggestionListBuilder {
	slb.suggestions = append(slb.suggestions, suggestion)
	return slb
}

func (slb *SuggestionListBuilder) SetSuggestions(suggestions []model.Suggestion) *SuggestionListBuilder {
	slb.suggestions = suggestions
	return slb
}

func (slb *SuggestionListBuilder) WithFilter() *SuggestionListBuilder {
	slb.filter = true
	slb.static = false
	return slb
}

func (slb *SuggestionListBuilder) WithStatic() *SuggestionListBuilder {
	slb.static = true
	slb.filter = false
	return slb
}

func (slb *SuggestionListBuilder) WithError() *SuggestionListBuilder {
	slb.errorOcurred = true
	return slb
}

func (slb *SuggestionListBuilder) Build() *model.SuggestionList {
	return &model.SuggestionList{
		Items:         slb.suggestions,
		Filter:        slb.filter,
		Static:        slb.static,
		ErrorOccurred: slb.errorOcurred,
	}
}

func NewSuggestionListBuilder() *SuggestionListBuilder {
	slb := &SuggestionListBuilder{suggestions: []model.Suggestion{}}
	return slb
}
