from spotipy import Spotify

from spotlight.items.item import Item
from spotlight.items.template_items import WarningItem
from spotlight.menu import Menu
from api.misc import MiscFunctions
from api.manager import PlaybackManager


class DeviceCommand(Menu):
    def __init__(self, sp: Spotify):
        Menu.__init__(self, "Device", "Click to select a device", "device", "device", [])
        self.sp = sp

    def refresh_items(self):
        devices = MiscFunctions(self.sp).get_device_list()
        self.clear_menu_items()
        if not devices:
            self.add_menu_item(
                WarningItem("No devices currently available", "Make sure the Spotify desktop app is open"))
        else:
            for device in devices:
                self.add_menu_item(DeviceItem(device["name"], device["type"], device["id"]))


class DeviceItem(Item):
    def __init__(self, name, type, id_):
        Item.__init__(self, name, type, "device", PlaybackManager.set_device, "", id_, "exe")
