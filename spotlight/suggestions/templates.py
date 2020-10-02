from spotlight.suggestions.suggestion import Suggestion


class FillSuggestion(Suggestion):
    def __init__(self, title, description, icon, fill_str):
        Suggestion.__init__(self, title, description, icon, lambda: None, fill_str, "", "fill")
        self.prefix = fill_str  # TODO Change this by creating a base class for ITEM


class WarningSuggestion(Suggestion):
    def __init__(self, title, description):
        Suggestion.__init__(self, title, description, "cog", lambda: None, "", "", "none")


class WarningFillSuggestion(Suggestion):
    def __init__(self, title, description, fill_str):
        Suggestion.__init__(self, title, description, "cog", lambda: None, "", fill_str, "fill")


class PassiveSuggestion(Suggestion):
    def __init__(self, title, description, icon):
        Suggestion.__init__(self, title, description, icon, lambda: None, "", "", "none")


class ExecutableSuggestion(Suggestion):
    def __init__(self, title, description, icon, function, parameter=""):
        Suggestion.__init__(self, title, description, icon, function, "", parameter, "exe")
