from api.manager import PlaybackManager
from spotlight.suggestions.templates import ExecutableSuggestion, FillSuggestion
from spotlight.commands.command import Command


class GoToCommand(Command):
    def __init__(self):
        Command.__init__(self, "Go to", "Seek to a point in a song e.g. '2:10'", "go to ")

    def get_suggestions(self, parameter=""):
        if parameter == "":
            return [FillSuggestion(self.title, self.description, "forward", "go to ")]
        else:
            return [ExecutableSuggestion(f"{self.title} {parameter['parameter']}", self.description, "forward",
                                         PlaybackManager.goto, parameter=parameter)]


class VolumeCommand(Command):
    def __init__(self):
        Command.__init__(self, "Volume", "Set volume level from 1-10", "volume ")

    def get_suggestions(self, parameter=""):
        if parameter == "":
            return [FillSuggestion(self.title, self.description, "volume", "volume ")]
        else:
            return [ExecutableSuggestion(f"{self.title} {parameter}", self.description, "volume",
                                         PlaybackManager.set_volume, parameter=parameter)]


class ShareCommand(Command):
    def __init__(self):
        Command.__init__(self, "Share", "Copies to clipboard the Spotify URL of the song currently playing", "share")

    def get_suggestions(self, parameter=""):
        if parameter != "":
            return []
        else:
            return [ExecutableSuggestion(self.title, self.description, "share", PlaybackManager.copy_url_to_clipboard)]


class AuthenticationCommand(Command):
    def __init__(self):
        Command.__init__(self, "Authentication", "Change Spotify API App Credentials", "authentication")

    def get_suggestions(self, parameter=""):
        if parameter != "":
            return []
        else:
            return [ExecutableSuggestion(self.title, self.description, "cog", lambda: None)]  # Special Case


class ExitCommand(Command):
    def __init__(self):
        Command.__init__(self, "Exit", "Exits the Spotightlify application", "exit")

    def get_suggestions(self, parameter=""):
        if parameter != "":
            return []
        else:
            return [ExecutableSuggestion(self.title, self.description, "exit", PlaybackManager.exit_app)]
