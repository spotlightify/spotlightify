class Command:
    def __init__(self, title: str, description: str, prefix: str):
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

    def get_suggestions(self, **kwargs):
        pass
