from math import ceil

from spotlight.suggestions.suggestion import Suggestion


class MenuSuggestion(Suggestion):
    """
    A Suggestion that, when clicked, displays more suggestions. Suggestions are paged and
    """

    def __init__(self, title: str, description: str, icon: str, fill_str: str, menu_suggestions: list,
                 fill_prefix=True):
        """

        :param title:
        :param description:
        :param icon:
        :param fill_str:
        :param menu_suggestions: stores a list of Suggestions to be displayed
        :param fill_prefix: confirms that when clicked the fill_str will fill into the Spotlight search
        """
        Suggestion.__init__(self, title, description, icon, lambda: None, fill_str,
                            "", "menu_fill" if fill_prefix else "menu")
        self.__menu_suggestions = []
        self.menu_suggestions = menu_suggestions

    @property
    def menu_suggestions(self):
        return self.__menu_suggestions

    @menu_suggestions.setter
    def menu_suggestions(self, value: list):
        if len(value) > 6:  # pages lists over 6 Suggestions
            self.__menu_suggestions = PagingSuggestions.page_suggestions(value)
        else:
            self.__menu_suggestions = value

    def add_menu_suggestion(self, item: Suggestion):
        self.menu_suggestions.append(item)

    def clear_menu_suggestions(self):
        self.menu_suggestions = []

    def refresh_menu_suggestions(self):
        pass


class PagingSuggestions:
    """
    Puts a list of suggestions into pages, primarily used for Option and Menu Suggestions
    """

    @staticmethod
    def page_suggestions(items: list):
        # create pages list
        len_ = len(items)
        if len_ > 6:
            num_pages = ceil((len_ - 2) / 4)
        else:
            num_pages = 1

        pages = [[] for a in range(0, num_pages)]
        item_index = 1
        if num_pages > 1:
            for i in range(0, num_pages):
                if i == 0:
                    pages[0].append(items[0])
                elif i > 0:  # Adds a 'previous page' suggestion after the for every page after the first
                    pages[i].append(PageChangeSuggestion("previous", pages, i, num_pages))
                for a in range(item_index, item_index + 4 if len_ - item_index >= 4 else len_):
                    pages[i].append(items[a])
                    item_index += 1
                if num_pages > 1 and i != num_pages - 1:  # Adds a 'next page' suggestion for every page before the last
                    pages[i].append(PageChangeSuggestion("next", pages, i, num_pages))
                if i == num_pages - 1 and (len_ - 2) % 4 == 0 and num_pages != 1:
                    pages[i].append(items[-1])
        else:
            pages[0].extend(items)


        return pages[0]  # all suggestions from the initial list can be accessed through this page


class PageChangeSuggestion(MenuSuggestion):
    def __init__(self, navigation: str, pages: list, page_index: int, num_pages):
        """
        Used for navigation
        :param navigation: either "next", "previous" or "back"
        :param page_index: index of last page shown
        """
        MenuSuggestion.__init__(self, "Next Page" if navigation == "next" else "Previous Page",
                                f"Page {page_index + 1} of {num_pages}",
                                "forward-nav" if navigation == "next" else "back-nav",
                                "", [], fill_prefix=False)
        self.menu_suggestions = []
        self.pages = pages
        self.page_index = page_index
        self.navigation = navigation

    def refresh_menu_suggestions(self):
        # It's more efficient putting the below code here instead of in the __init__
        if self.navigation == "next":
            self.menu_suggestions = self.pages[self.page_index + 1]
        else:
            self.menu_suggestions = self.pages[self.page_index - 1]
