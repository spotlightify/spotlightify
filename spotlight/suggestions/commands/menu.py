from spotlight.suggestions.suggestion import Suggestion

class Menu(Suggestion):
    def __init__(self, title: str, description: str, icon: str, prefix: str, menu_items: list, fill_prefix=True):
        Suggestion.__init__(self, title, description, icon, None, menu_items,
                            prefix, "menu_fill" if fill_prefix else "menu")

    def add_menu_item(self, item: Suggestion):
        self.parameter.append(item)

    def clear_menu_items(self):
        self.parameter = []
