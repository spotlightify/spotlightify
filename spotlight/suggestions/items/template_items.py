from spotlight.suggestions.suggestion import Suggestion
from spotlight.manager.manager import PlaybackManager

# Item classes that are used in more than one file should be written into this file

class FillItem(Suggestion):
    def __init__(self, title, description, icon, fill_str):
        Suggestion.__init__(self, title, description, icon, lambda: None, fill_str, "fill")
        self.prefix = fill_str  # TODO Change this by creating a base class for ITEM


class WarningItem(Suggestion):
    def __init__(self, title, description):
        Suggestion.__init__(self, title, description, "cog", lambda: None, "", "none")


class WarningFillItem(Suggestion):
    def __init__(self, title, description, fill_str):
        Suggestion.__init__(self, title, description, "cog", lambda: None, "", "fill")
        self.prefix = fill_str  # TODO Change this by creating a base class for ITEM


class PassiveItem(Suggestion):
    def __init__(self, title, description, icon):
        Suggestion.__init__(self, title, description, icon, lambda: None, "", "none")
