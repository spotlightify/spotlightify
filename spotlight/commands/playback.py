from api.manager import PlaybackManager
from spotlight.suggestions.templates import ExecutableSuggestion
from spotlight.commands.command import Command


class ResumeCommand(Command):
    def __init__(self):
        Command.__init__(self, "Resume", "Resumes playback", "resume")

    def get_suggestions(self, parameter=""):
        if parameter != "":
            return []
        else:
            return [ExecutableSuggestion(self.title, self.description, "play", PlaybackManager.resume)]


class PauseCommand(Command):
    def __init__(self):
        Command.__init__(self, "Pause", "Pauses playback", "pause")

    def get_suggestions(self, parameter=""):
        if parameter != "":
            return []
        else:
            return [ExecutableSuggestion(self.title, self.description, "pause", PlaybackManager.pause)]


class NextCommand(Command):
    def __init__(self):
        Command.__init__(self, "Next", "Skips current song", "next")

    def get_suggestions(self, parameter=""):
        if parameter != "":
            return []
        else:
            return [ExecutableSuggestion(self.title, self.description, "forward", PlaybackManager.skip)]


class PreviousCommand(Command):
    def __init__(self):
        Command.__init__(self, "Previous", "Plays previous song", "previous")

    def get_suggestions(self, parameter=""):
        if parameter != "":
            return []
        else:
            return [ExecutableSuggestion(self.title, self.description, "backward", PlaybackManager.previous)]


class SavedCommand(Command):
    def __init__(self):
        Command.__init__(self, "Saved", "Plays saved/liked songs", "saved")

    def get_suggestions(self, parameter=""):
        if parameter != "":
            return []
        else:
            return [ExecutableSuggestion(self.title, self.description, "heart", PlaybackManager.play_liked)]
