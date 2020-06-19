from spotlight.commands.base import BaseCommand

class Options:
    def __init__(self):
        self.suggestion_list = []

    def add_option_suggestion(self, title, description, icon, function, parameter, prefix, setting):
        self.suggestion_list.append(BaseCommand(title, description, icon, function, parameter, prefix, setting).get_dicts("")[0])

    def remove_option_suggestion(self, index: int):
        try:
            self.suggestion_list.__delitem__(index)
        except IndexError:
            print("[Error] Cannot remove option. Index out of range (Line 14 options.py)")

    def get_suggestion_dicts(self) -> list:
        if not self.suggestion_list:
            return BaseCommand("No options added", "add options", "cog", None, "", "", None).get_dicts("")
        return self.suggestion_list
