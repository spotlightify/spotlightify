from definitions import ASSETS_DIR, CACHE_DIR
from os import sep


class Suggestion:
    """
    All suggestions and items inherit from this class
    """

    def __init__(self, title: str, description: str, icon_name: str, function: classmethod, parameter: str,
                 prefix: str, setting: str):
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
        self.icon_name = icon_name
        self.function = function
        self.parameter = parameter
        self.prefix = prefix
        self.setting = setting

    def _get_command_dict(self) -> dict:
        """
        Populates a dictionary which can be used to show the command graphically
        :return: a command dictionary made from the class attributes
        """
        # checks to see if icon is album art jpg or icon svg by looking at the icon_name's string length
        icon_path = f"{CACHE_DIR}art{sep}{self.icon_name}.jpg" if len(
            self.icon_name) == 22 else f"{ASSETS_DIR}svg{sep}{self.icon_name}.svg"
        dictionary = {"title": self.title, "description": self.description, "icon": icon_path,
                      "function": self.function, "parameter": self.parameter, "prefix": self.prefix,
                      "setting": self.setting}
        return dictionary

    def get_items(self, parameter="") -> list:
        return [self]

    def get_dict(self) -> list:
        """
        This method is overridden in child classes
        :param parameter: parameter is used on other child classes to add more command dictionaries to the list
        :return: returns the suggestions dictionaries associated with the current class
        """
        dictionary = self._get_command_dict()
        return dictionary
