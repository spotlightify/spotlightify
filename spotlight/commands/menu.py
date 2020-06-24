from spotlight.commands.base import BaseCommand

class Menu(BaseCommand):
    def __init__(self, title: str, description: str, icon: str, prefix: str, menu_items: list, fill_prefix=True):
        BaseCommand.__init__(self, title, description, icon, None, menu_items,
                             prefix, "menu_fill" if fill_prefix else "menu")

    def add_menu_item(self, item: BaseCommand):
        self.parameter.append(item)

    def clear_menu_items(self):
        self.parameter = []
