from spotlight.suggestions.suggestion import Suggestion


class Item(Suggestion):
    def __init__(self, title: str, description: str, icon_name: str, function: classmethod, fill_str: str,
                 parameter: str,setting: str):
        Suggestion.__init__(self, title, description, icon_name, function, fill_str, parameter, setting)
