from spotlight.suggestions.suggestion import Suggestion


class BaseCommand(Suggestion):
    def __init__(self, title: str, description: str, icon_name: str, function: classmethod, parameter: str,
                 prefix: str, setting: str):
        Suggestion.__init__(self, title, description, icon_name, function, parameter, setting)
        self.prefix = prefix

    @property
    def prefix(self):
        return self.__prefix

    @prefix.setter
    def prefix(self, value):
        if type(value).__name__ != "str": raise Exception("Suggestion.prefix must be of type str")
        self.__prefix = value
