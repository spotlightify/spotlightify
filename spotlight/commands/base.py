from copy import deepcopy
from typing import overload

from definitions import ASSETS_DIR, CACHE_DIR
from os import sep

class BaseCommand:
    """
    All commands and items inherit from this class
    """
    def __init__(self, title: str, description: str, icon_name: str, function: classmethod, parameter: str, prefix: str, setting: str):
        """
        :param title: title of the suggestion (displayed visually)
        :param description: description of the suggestion (displayed visually)
        :param icon_name: name of svg icon (svg displayed visually)
        :param function: the function that is called if the command is executed
        :param parameter: additional text used by the command
        :param prefix: text which is entered to find the command
        :param setting: what happens when the command is clicked, this can be "exe" - calls the function,
                        "fill" - fills the prefix to the textbox, "list" - brings up a list of suggestions,
                        "none" - does nothing when clicked
        """
        self.title = title
        self.description = description
        if len(icon_name) == 22:  # checks to see if icon is album art jpg or icon svg by looking at the icon_name's string length
            self.icon_name = f"{CACHE_DIR}art{sep}{icon_name}.jpg"
        else:
            self.icon_name = f"{ASSETS_DIR}svg{sep}{icon_name}.svg"
        self.function = function
        self.parameter = parameter
        self.prefix = prefix
        self.setting = setting

    def _get_command_dict(self) -> dict:
        """
        Populates a dictionary which can be used to show the command graphically
        :return: a command dictionary made from the class attributes
        """
        dictionary = {}
        dictionary["title"] = self.title
        dictionary["description"] = self.description
        dictionary["icon"] = self.icon_name
        dictionary["function"] = self.function
        dictionary["parameter"] = self.parameter
        dictionary["prefix"] = self.prefix
        dictionary["setting"] = self.setting
        return dictionary

    def get_items(self, parameter="") -> list:
        pass

    def get_dict(self) -> list:
        """
        This method is overridden in child classes
        :param parameter: parameter is used on other child classes to add more command dictionaries to the list
        :return: returns the commands dictionaries associated with the current class
        """
        dictionary = self._get_command_dict()
        return dictionary
