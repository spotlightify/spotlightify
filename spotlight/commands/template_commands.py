from spotlight.commands.command import Command


class ParameterCommand(Command):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str):
        Command.__init__(self, title, description, icon, function, parameter, prefix, "fill")

    def get_items(self) -> list:
        if self.parameter != "":
            self.setting = "exe"
        else:
            self.setting = "fill"
        command = [self]
        return command
