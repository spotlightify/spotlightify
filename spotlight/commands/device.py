from copy import deepcopy
from definitions import ASSETS_DIR, CACHE_DIR
from os import sep
from spotipy import Spotify

from spotlight.commands.item import WarningItem
from spotlight.commands.menu import Menu
from spotlight.manager.misc import MiscFunctions
from spotlight.commands.base import BaseCommand
from spotlight.manager.manager import PlaybackManager


class DeviceCommand(Menu):
    def __init__(self, sp: Spotify):
        Menu.__init__(self, "Device", "Click to select a device", "device", "device", [])
        self.sp = sp

    def _get_command_dict(self) -> dict:
        dictionary = super(DeviceCommand, self)._get_command_dict()
        devices = MiscFunctions(self.sp).get_device_list()
        self.clear_menu_items()
        if not devices:
            self.add_menu_item(WarningItem("No devices currently available", "Make sure the Spotify desktop app is open"))
        else:
            for device in devices:
                self.add_menu_item(DeviceItem(device["name"], device["type"], device["id"]))
        return dictionary


class DeviceItem(BaseCommand):
    def __init__(self, name, type, id_):
        BaseCommand.__init__(self, name, type, "device", PlaybackManager.set_device, id_, "", "exe")
