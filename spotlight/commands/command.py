from spotlight.suggestion import Suggestion


class Command(Suggestion):
    def __init__(self, title: str, description: str, icon_name: str, function: classmethod, parameter: str,
                 prefix: str, setting: str):
        Suggestion.__init__(self, title, description, icon_name, function, prefix, parameter, setting)

    def get_items(self) -> list:
        return [self]
