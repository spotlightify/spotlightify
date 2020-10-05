from spotlight.suggestions.suggestion import Suggestion


class OptionSuggestion(Suggestion):
    """
    Shows option suggestions (option_items list of Suggestions) when shift+enter is inputted on this suggestion from
    the Spotlightify Search
    """
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, fill_str: str,
                 setting: str, option_items=None):
        """

        :param title:
        :param description:
        :param icon:
        :param function:
        :param parameter:
        :param fill_str:
        :param setting:
        :param option_items: Shows a maximum of 6 (currently) Suggestions stored in a list
        """
        Suggestion.__init__(self, title, description, icon, function, parameter, fill_str, setting)
        if option_items is None:
            option_items = []
        self.option_items = option_items


