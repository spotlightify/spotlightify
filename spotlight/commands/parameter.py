from copy import deepcopy
from spotlight.commands.base import BaseCommand


class ParameterCommand(BaseCommand):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str,
                 setting: str):
        BaseCommand.__init__(self, title, description, icon, function, parameter, prefix, setting)

    def get_dicts(self, parameter: str) -> list:
        command_list = [self._command_dict]
        if parameter != "":
            new_command = deepcopy(self._command_dict)
            new_command["setting"] = "exe"
            new_command["parameter"] = parameter
            command_list = [new_command]
        return command_list
