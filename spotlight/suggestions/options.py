from spotlight.suggestions.menu import PagingSuggestions
from spotlight.suggestions.suggestion import Suggestion


class OptionSuggestion(Suggestion):
    """
    Shows option suggestions (option_items list of Suggestions) when shift+enter is inputted on this suggestion from
    the Spotlightify Search
    """
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, fill_str: str,
                 setting: str, option_suggestions=None):
        """

        :param title:
        :param description:
        :param icon:
        :param function:
        :param parameter:
        :param fill_str:
        :param setting:
        :param option_suggestions: list of Suggestions which will appear as options. Maximum of 6
        """
        Suggestion.__init__(self, title, description, icon, function, parameter, fill_str, setting)
        if option_suggestions is None:
            option_suggestions = []
        self.__option_suggestions = []
        self.option_suggestions = option_suggestions

    @property
    def option_suggestions(self):
        return self.__option_suggestions

    @option_suggestions.setter
    def option_suggestions(self, suggestions: list):
        if len(suggestions) > 6:  # pages lists over 6 Suggestions
            self.__option_suggestions = PagingSuggestions.page_suggestions(suggestions)
        else:
            self.__option_suggestions = suggestions

