from spotlight.suggestions.commands.command import Command
from spotlight.suggestions.suggestion import Suggestion

class Menu(Command):
    def __init__(self, title: str, description: str, icon: str, prefix: str, menu_items: list, fill_prefix=True):
        Suggestion.__init__(self, title, description, icon, lambda: None, prefix,
                            "", "menu_fill" if fill_prefix else "menu")
        self.__menu_items = []
        self.menu_items = menu_items

    @property
    def menu_items(self):
        return self.__menu_items

    @menu_items.setter
    def menu_items(self, value):
        self.__menu_items = value

    def add_menu_item(self, item: Suggestion):
        self.menu_items.append(item)

    def clear_menu_items(self):
        self.menu_items = []

    def get_items(self, match: bool) -> list:
        """

        :param prompt_text: This is the whole text that has been typed into the prompt. NOT just what comes after the prefix
        :return:
        """
        if not match:
            return super(Menu, self).get_items()
        else:
            self.refresh_items()
            return self.menu_items

    def refresh_items(self):
        pass
