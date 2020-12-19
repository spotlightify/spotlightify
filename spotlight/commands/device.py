from spotipy import Spotify

from api.manager import PlaybackManager
from api.misc import MiscFunctions
from spotlight.suggestions.device import DeviceMenuSuggestions
from spotlight.suggestions.menu import MenuSuggestion
from spotlight.commands.command import Command
from spotlight.suggestions.templates import ExecutableSuggestion, WarningSuggestion


class DeviceCommand(Command):
    """
    Device Command allow's user to view and select available devices to stream on
    """
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Device", "Set the device to play music from", "device")
        self.sp = sp

    def get_suggestions(self, parameter=""):
        if parameter != "":  # menu item will not be retrieved if there is text in the parameter str
            return []
        else:
            return [DeviceMenuSuggestions(self.sp)]
