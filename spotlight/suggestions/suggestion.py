from definitions import ASSETS_DIR, CACHE_DIR
from os import sep


class Suggestion:
    """
    All suggestions and suggestions inherit from this class
    """

    def __init__(self, title: str, description: str, icon_name: str, function: classmethod, fill_str: str, parameter, setting: str):
        """
        :param title: title of the suggestion (displayed visually)
        :param description: description of the suggestion (displayed visually)
        :param icon_name: name of svg icon (svg displayed visually)
        :param function: the function that is called if the command is executed
        :param parameter: additional text used by the command
        :param fill_str: text which is entered to find the command
        :param setting: what happens when the command is clicked, this can be "exe" - calls the function,
                        "fill" - fills the prefix to the textbox, "none" - does nothing when clicked
        """
        self.__title = None
        self.__description = None
        self.__icon_name = None
        self.__function = None
        self.__parameter = None
        self.__setting = None
        self.__fill_str = None
        self.title = title
        self.description = description
        self.icon_name = icon_name
        self.function = function
        self.parameter = parameter
        self.setting = setting
        self.fill_str = fill_str

    @property
    def title(self):
        return self.__title

    @title.setter
    def title(self, value):
        if type(value).__name__ != "str": raise Exception("Suggestion.title must be of type str")
        if len(value) == 0:
            self.__title = ""
        else:
            self.__title = f"{value[0].upper() + value[1:]}"

    @property
    def description(self):
        return self.__description

    @description.setter
    def description(self, value):
        if type(value).__name__ != "str": raise Exception("Suggestion.description must be of type str")
        self.__description = value

    @property
    def icon_name(self):
        return self.__icon_name

    @icon_name.setter
    def icon_name(self, value):
        if type(value).__name__ != "str": raise Exception("Suggestion.icon_name must be of type str and (the name of an icon or album ID of cached album art)")
        if len(value) == 22:
            self.__icon_name = f"{CACHE_DIR}art{sep}{value}.jpg"
        else:
            self.__icon_name = f"{ASSETS_DIR}svg{sep}{value if value!='' else 'no-texture'}.svg"

    @property
    def function(self):
        return self.__function

    @function.setter
    def function(self, value):
        if value == None:
            self.function = None
        elif type(value).__name__ != "function": raise Exception("Suggestion.function must be of type function")
        else:
            self.__function = value

    @property
    def parameter(self):
        return self.__parameter

    @parameter.setter
    def parameter(self, value):
        self.__parameter = value

    @property
    def setting(self):
        return self.__setting

    @setting.setter
    def setting(self, value):
        settings = ["none", "fill", "menu", "menu_fill", "exe"]
        if any([a == value for a in settings]):
            self.__setting = value
        else:
            raise Exception(f"Suggestion.setting must be str of {', '.join(settings[:-1])} or {settings[-1]}")

    @property
    def fill_str(self):
        return self.__fill_str

    @fill_str.setter
    def fill_str(self, value):
        if type(value).__name__ != "str": raise Exception("Suggestion.prefix must be of type str")
        self.__fill_str = value
