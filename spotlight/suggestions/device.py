from spotipy import Spotify

from api.manager import PlaybackManager
from api.misc import MiscFunctions
from spotlight.suggestions.menu import MenuSuggestion
from spotlight.suggestions.templates import WarningSuggestion, ExecutableSuggestion


class DeviceMenuSuggestions(MenuSuggestion):
    """
    Device Menu Suggestion, when clicked shows device suggestions
    """
    def __init__(self, sp: Spotify):
        MenuSuggestion.__init__(self, "Device", "Set The device to play music from", "device", "device", [])
        self.sp = sp

    def refresh_menu_suggestions(self):
        devices = MiscFunctions(self.sp).get_device_list()
        self.clear_menu_suggestions()
        if not devices:
            self.add_menu_suggestion(
                WarningSuggestion("No devices currently available", "Make sure the Spotify desktop app is open"))
        else:
            for device in devices:
                self.add_menu_suggestion(ExecutableSuggestion(device["name"], device["type"], "device",
                                                              PlaybackManager.set_device, parameter=device["id"]))
