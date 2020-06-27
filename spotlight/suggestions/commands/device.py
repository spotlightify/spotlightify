from spotipy import Spotify

from spotlight.suggestions.items.template_items import WarningItem
from spotlight.suggestions.commands.menu import Menu
from spotlight.manager.misc import MiscFunctions
from spotlight.suggestions.suggestion import Suggestion
from spotlight.manager.manager import PlaybackManager


class DeviceCommand(Menu):
    def __init__(self, sp: Spotify):
        Menu.__init__(self, "Device", "Click to select a device", "device", "device", [])
        self.sp = sp

    def get_items(self, parameter="") -> list:
        devices = MiscFunctions(self.sp).get_device_list()
        self.clear_menu_items()
        if not devices:
            self.add_menu_item(WarningItem("No devices currently available", "Make sure the Spotify desktop app is open"))
        else:
            for device in devices:
                self.add_menu_item(DeviceItem(device["name"], device["type"], device["id"]))
        return super(DeviceCommand, self).get_items(parameter)


class DeviceItem(Suggestion):
    def __init__(self, name, type, id_):
        Suggestion.__init__(self, name, type, "device", PlaybackManager.set_device, id_, "", "exe")
