from api.manager import PlaybackManager
from spotlight.items.template_items import ExecutableItem
from spotlight.new_commands.command import Command


class GoToCommand(Command):
    def __init__(self):
        Command.__init__(self, "GoTo", "Seek to a point in a song e.g. '2:10'", "goto")

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        return [ExecutableItem(self.title, self.description, "forward", PlaybackManager.goto)]


class VolumeCommand(Command):
    def __init__(self):
        Command.__init__(self, "GoTo", "Seek to a point in a song e.g. '2:10'", "goto")

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        return [ExecutableItem(self.title, self.description, "forward", PlaybackManager.goto)]
