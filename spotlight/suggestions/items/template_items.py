from spotlight.suggestions.items.item import Item
from spotlight.suggestions.suggestion import Suggestion
from spotlight.manager.manager import PlaybackManager


# Item classes that are used in more than one file should be written into this file

class FillItem(Item):
    def __init__(self, title, description, icon, fill_str):
        Item.__init__(self, title, description, icon, lambda: None, fill_str, "", "fill")
        self.prefix = fill_str  # TODO Change this by creating a base class for ITEM


class WarningItem(Item):
    def __init__(self, title, description):
        Item.__init__(self, title, description, "cog", lambda: None, "", "", "none")


class WarningFillItem(Item):
    def __init__(self, title, description, fill_str):
        Item.__init__(self, title, description, "cog", lambda: None, "", fill_str, "fill")


class PassiveItem(Item):
    def __init__(self, title, description, icon):
        Item.__init__(self, title, description, icon, lambda: None, "", "", "none")
