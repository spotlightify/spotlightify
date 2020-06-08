from spotlight.commands.base import BaseCommand
from spotlight.manager.manager import PlaybackManager


class ParameterCommand(BaseCommand):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str,
                 setting: str):
        BaseCommand.__init__(self, title, description, icon, function, parameter, prefix, setting)

    def get_dicts(self, parameter: str) -> list:
        command_list = [self._command_dict]
        if parameter != "":
            command_list = [self._populate_new_dict("Go to", "Seeks a position in the current song, i.e. 1:40",
                                                    "forward", parameter, "exe")]
        return command_list
