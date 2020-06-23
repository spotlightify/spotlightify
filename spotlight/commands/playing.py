from copy import deepcopy
from definitions import ASSETS_DIR, CACHE_DIR
from os import sep

from spotlight.commands.item import FillItem, WarningItem
from spotlight.manager.playback import PlaybackFunctions
from spotipy import Spotify
from spotlight.manager.misc import MiscFunctions
from spotlight.commands.base import BaseCommand
from spotlight.manager.manager import PlaybackManager


class PlayingCommand(BaseCommand):
    def __init__(self, sp: Spotify):
        BaseCommand.__init__(self, "Currently Playing", "Displays the song which is currently playing", "play", None, "", "currently playing", "list")
        self.sp = sp

    def get_items(self, parameter="") -> list:
        song = PlaybackFunctions(self.sp).get_current_song_info()
        item = [self]
        try:
            self.parameter = [FillItem(f"Playing {song['name']}", f"By {song['artist']}", song["image"], "currently playing")]
        except KeyError:
            self.parameter = [WarningItem("Error: No device selected", "please select a device using the 'device' command")]
        return item
