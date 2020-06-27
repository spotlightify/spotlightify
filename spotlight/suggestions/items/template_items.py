from spotlight.suggestions.suggestion import Suggestion
from spotlight.manager.manager import PlaybackManager

# Item classes that are used in more than one file should be written into this file

class FillItem(Suggestion):
    def __init__(self, title, description, icon, fill_str):
        Suggestion.__init__(self, title, description, icon, lambda: None, fill_str, "fill")


class WarningItem(Suggestion):
    def __init__(self, title, description):
        Suggestion.__init__(self, title, description, "cog", lambda: None, "", "none")


class PassiveItem(Suggestion):
    def __init__(self, title, description):
        Suggestion.__init__(self, title, description, "cog", lambda: None, "", "none")
