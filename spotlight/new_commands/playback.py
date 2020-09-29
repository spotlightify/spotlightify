from api.manager import PlaybackManager
from spotlight.items.template_items import ExecutableItem
from spotlight.new_commands.command import Command


class ResumeCommand(Command):
    def __init__(self):
        Command.__init__(self, "Resume", "Resumes playback", "resume")

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        else:
            return [ExecutableItem(self.title, self.description, "play", PlaybackManager.resume)]


class PauseCommand(Command):
    def __init__(self):
        Command.__init__(self, "Pause", "Pauses playback", "pause")

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        else:
            return [ExecutableItem(self.title, self.description, "pause", PlaybackManager.pause)]


class NextCommand(Command):
    def __init__(self):
        Command.__init__(self, "Next", "Skips current song", "next")

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        else:
            return [ExecutableItem(self.title, self.description, "forward", PlaybackManager.skip)]


class PreviousCommand(Command):
    def __init__(self):
        Command.__init__(self, "Previous", "Plays previous song", "previous")

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        else:
            return [ExecutableItem(self.title, self.description, "backward", PlaybackManager.previous)]
