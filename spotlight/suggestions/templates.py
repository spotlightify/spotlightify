from spotlight.suggestions.suggestion import Suggestion


class FillSuggestion(Suggestion):
    """
    A template Suggestion which pastes the fill_str variable into the Spotlight search
    """
    def __init__(self, title, description, icon, fill_str):
        Suggestion.__init__(self, title, description, icon, lambda: None, fill_str, "", "fill")


class WarningSuggestion(Suggestion):
    """
    A template Suggestion which presents a non-clickable warning message
    """
    def __init__(self, title, description):
        Suggestion.__init__(self, title, description, "cog", lambda: None, "", "", "none")


class WarningFillSuggestion(Suggestion):
    """
    A template Suggestion which shows a warning message and when clicked, pastes the fill_str variable into the Spotlight search
    """
    def __init__(self, title, description, fill_str):
        Suggestion.__init__(self, title, description, "cog", lambda: None, fill_str, "" , "fill")


class PassiveSuggestion(Suggestion):
    """
    A template Suggestion which presents a non-clickable message
    """
    def __init__(self, title, description, icon):
        Suggestion.__init__(self, title, description, icon, lambda: None, "", "", "none")


class ExecutableSuggestion(Suggestion):
    """
    A template which executes a classmethod (from the PlaybackManager class) when clicked
    """
    def __init__(self, title, description, icon, function, parameter=""):
        Suggestion.__init__(self, title, description, icon, function, "", parameter, "exe")
