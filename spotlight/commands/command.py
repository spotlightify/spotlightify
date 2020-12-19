import abc
from typing import List

from spotlight.suggestions.suggestion import Suggestion


class Command:
    """
    The base abstract class for Commands.
    Class used to output Suggestions via the get_suggestions method
    """
    def __init__(self, title: str, description: str, prefix: str):
        """

        :param title: Title of the command
        :param description: Description of the command
        :param prefix: Prefix of the command, used to match suggestions when
        """
        self.__title = None
        self.__description = None
        self.__prefix = None
        # setting
        self.title = title
        self.description = description
        self.prefix = prefix

    @property
    def title(self):
        return self.__title

    @title.setter
    def title(self, value: str):
        if type(value).__name__ != "str": raise Exception("Suggestion.title must be of type str")
        if len(value) == 0:
            self.__title = ""
        else:
            self.__title = f"{value[0].upper() + value[1:]}"

    @property
    def description(self):
        return self.__description

    @description.setter
    def description(self, value: str):
        if type(value).__name__ != "str": raise Exception("Suggestion.description must be of type str")
        if len(value) == 0:
            self.__description = ""
        else:
            self.__description = f"{value[0].upper() + value[1:]}"

    @property
    def prefix(self):
        return self.__prefix

    @prefix.setter
    def prefix(self, value: str):
        if type(value).__name__ != "str": raise Exception("Suggestion.prefix must be of type str")
        self.__prefix = value

    @abc.abstractmethod
    def get_suggestions(self, parameter="") -> List[Suggestion]:
        pass
