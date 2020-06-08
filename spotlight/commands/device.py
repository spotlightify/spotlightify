from copy import deepcopy
from definitions import ASSETS_DIR, CACHE_DIR
from os import sep
from spotipy import Spotify
from spotlight.manager.misc import MiscFunctions
from spotlight.commands.base import BaseCommand
from spotlight.manager.manager import PlaybackManager


class DeviceCommand(BaseCommand):
    def __init__(self, sp: Spotify):
        BaseCommand.__init__(self, "Device", "Select device", "device", None, "", "device", "list")
        self.sp = sp

    def _populate_new_command_dict(self, title: str, description: str, icon_name: str, function: classmethod, parameter: str, prefix: str, setting: str):
        command_dict = {"title": title, "description": description, "icon": None, "function": function, "parameter": parameter,
                        "prefix": prefix, "setting": setting}
        if not len(icon_name) > 20:
            command_dict["icon"] = f"{ASSETS_DIR}svg{sep}{icon_name}.svg"
        else:
            command_dict["icon"] = f"{CACHE_DIR}art{sep}{icon_name}.jpg"
        return command_dict

    def get_dicts(self, parameter: str) -> list:
        device_list = MiscFunctions(self.sp).get_device_list()
        device_command_list = []
        if not device_list:
            device_command_list = [self._populate_command_dict("No Devices Available", "Open your Spotify Desktop App",
                                                               "cog", None, "", "", "none")]
        else:
            for device in device_list:
                device_command_list.append(self._populate_new_command_dict(device["name"], device["type"], "device",
                                                                       PlaybackManager.set_device, device["id"],
                                                                       "", "exe"))
        new_command = deepcopy(self._command_dict)
        new_command["parameter"] = device_command_list
        command_list = [new_command]
        return command_list
