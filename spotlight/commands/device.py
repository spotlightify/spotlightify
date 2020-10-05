from spotipy import Spotify

from api.manager import PlaybackManager
from api.misc import MiscFunctions
from spotlight.suggestions.menu import MenuSuggestion
from spotlight.commands.command import Command
from spotlight.suggestions.templates import ExecutableSuggestion, WarningSuggestion


class DeviceCommand(Command):
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Device", "Set the device to play music from", "device")
        self.sp = sp

    def get_suggestions(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        else:
            return [DeviceMenuSuggestions(self.sp)]

class DeviceMenuSuggestions(MenuSuggestion):
    def __init__(self, sp: Spotify):
        MenuSuggestion.__init__(self, "Device", "Set The device to play music from", "device", "device", [])
        self.sp = sp

    def refresh_menu_items(self):
        devices = MiscFunctions(self.sp).get_device_list()
        self.clear_menu_items()
        if not devices:
            self.add_menu_item(
                WarningSuggestion("No devices currently available", "Make sure the Spotify desktop app is open"))
        else:
            for device in devices:
                self.add_menu_item(ExecutableSuggestion(device["name"], device["type"], "device",
                                                        PlaybackManager.set_device, parameter=device["id"]))
