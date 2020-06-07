from definitions import ASSETS_DIR, CACHE_DIR
from os import sep

class BaseCommand:
    def __init__(self, title: str, description: str, icon_name: str, function: classmethod, parameter: str, prefix: str, setting: str):
        self._command_dict = {"title": "str", "description": "str", "icon": "path_str", "function": None,
                              "parameter": "traceback._some_str", "prefix": "str", "setting": "fill/exe"}  # command in dictionary form
        self.prefix = prefix
        self._populate_command_dict(title, description, icon_name, function, parameter, prefix, setting)

    def _populate_command_dict(self, title: str, description: str, icon_name: str, function: classmethod, parameter: str, prefix: str, setting: str):
        self._command_dict["title"] = title
        self._command_dict["description"] = description
        if not len(icon_name) > 20:
            self._command_dict["icon"] = f"{ASSETS_DIR}svg{sep}{icon_name}.svg"
        else:
            self._command_dict["icon"] = f"{CACHE_DIR}art{sep}{icon_name}.jpg"
        self._command_dict["function"] = function
        self._command_dict["parameter"] = parameter
        self._command_dict["prefix"] = prefix
        self._command_dict["setting"] = setting

    def get_dicts(self, parameter: str) -> list:
        return [self._command_dict]
