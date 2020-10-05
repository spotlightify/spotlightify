from math import ceil

from spotlight.suggestions.suggestion import Suggestion

class MenuSuggestion(Suggestion):
    def __init__(self, title: str, description: str, icon: str, fill_str: str, menu_items: list, fill_prefix=True):
        Suggestion.__init__(self, title, description, icon, lambda: None, fill_str,
                            "", "menu_fill" if fill_prefix else "menu")
        self.__menu_items = []
        self.menu_items = menu_items
        self.pages = [[]]

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
            return [self]
        else:
            self.refresh_menu_items()
            return self.menu_items

    def refresh_menu_items(self):
        self.__page_menu_items()

    def __page_menu_items(self):
        # create pages list
        items = self.menu_items
        len_ = len(items)
        if len_ > 6:
            num_pages = ceil(len_ / 4)
        else:
            num_pages = 1

        pages = self.pages
        item_index = 1
        for i in range(0, num_pages):
            if i == 0:
                pages[0].append(items[0])
            elif i > 0:  # Adds a 'previous page' suggestion after the for every page after the first
                pages.append([])
                pages[i].append(PageChangeSuggestion("previous", pages, i, num_pages))
            for a in range(item_index, item_index + 4 if len_ - item_index >= 4 else len_):
                pages[i].append(items[a])
                item_index += 1
            if num_pages > 1 and i != num_pages - 1:  # Adds a 'next page' suggestion for every page before the last
                pages[i].append(PageChangeSuggestion("next", pages, i, num_pages))
            if len_ == 6:  # if there are 6 menu items to be displayed, this 'if' statement is needed to display the 6th item
                pages[0].append(items[5])

        self.menu_items = pages[0]


class PageChangeSuggestion(MenuSuggestion):
    def __init__(self, navigation: str, pages: list, page_index: int, num_pages):
        """
        Used for navigation
        :param navigation: either "next", "previous" or "back"
        :param page_index: index of last page shown
        """
        MenuSuggestion.__init__(self, "Next Page" if navigation == "next" else "Previous Page",
                      f"Page {page_index + 1} of {num_pages}", "forward" if navigation == "next" else "backward",
                      "", [], fill_prefix=False)
        self.navigation = navigation
        self.pages = pages
        self.page_index = page_index

    def refresh_menu_items(self):
        if self.navigation == "next":
            self.menu_items = self.pages[self.page_index + 1]
        else:
            self.menu_items = self.pages[self.page_index - 1]
