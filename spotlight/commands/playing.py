from copy import deepcopy
from definitions import ASSETS_DIR, CACHE_DIR
from os import sep
from spotlight.manager.playback import PlaybackFunctions
from spotipy import Spotify
from spotlight.manager.misc import MiscFunctions
from spotlight.commands.base import BaseCommand
from spotlight.manager.manager import PlaybackManager


class PlayingCommand(BaseCommand):
    def __init__(self, sp: Spotify):
        BaseCommand.__init__(self, "Currently Playing", "Displays the song which is currently playing", "play", None, "", "currently playing", "list")
        self.sp = sp

    def get_dicts(self, parameter: str) -> list:
        song = PlaybackFunctions(self.sp).get_current_song_info()
        new_command = deepcopy(self._command_dict)
        try:
            new_command["parameter"] = [self._populate_new_dict(f"Playing {song['name']}", f"By {song['artist']}", song["image"], "", "fill")]
        except KeyError:
            new_command["parameter"] = [self._populate_new_dict("No Device Selected", "Use the device command to select a device", "exit", [], "none")]
        command_list = [new_command]
        return command_list
