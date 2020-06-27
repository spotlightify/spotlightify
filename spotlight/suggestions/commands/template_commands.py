from spotlight.suggestions.commands.base import BaseCommand
from spotlight.suggestions.suggestion import Suggestion


class ParameterCommand(BaseCommand):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str):
        BaseCommand.__init__(self, title, description, icon, function, parameter, prefix, "fill")

    def get_items(self, parameter="") -> list:
        self.parameter = parameter
        if parameter != "":
            self.setting = "exe"
        else:
            self.setting = "fill"
        command = [self]
        return command
