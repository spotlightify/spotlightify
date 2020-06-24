from copy import deepcopy
from definitions import ASSETS_DIR, CACHE_DIR
from os import sep

from spotlight.commands.item import FillItem, WarningItem
from spotlight.commands.menu import Menu
from spotlight.manager.playback import PlaybackFunctions
from spotipy import Spotify
from spotlight.manager.misc import MiscFunctions
from spotlight.commands.base import BaseCommand
from spotlight.manager.manager import PlaybackManager


class PlayingCommand(Menu):
    def __init__(self, sp: Spotify):
        item = PlayingItem(sp)
        Menu.__init__(self, "Currently Playing", "Displays the song which is currently playing", "play", "currently playing", [item])
        self.sp = sp


class PlayingItem(BaseCommand):
    def __init__(self, sp: Spotify):
        BaseCommand.__init__(self, "", "", "", None, "", "", "none")
        self.sp = sp

    def _get_command_dict(self) -> dict:
        song = PlaybackFunctions(self.sp).get_current_song_info()
        try:
            item = FillItem(f"Playing {song['name']}", f"By {song['artist']}", song["image"], "currently playing")
            item.prefix = song['name']
        except KeyError:
            item = WarningItem("No song currently playing", "")
        dictionary = item.get_dict()
        return dictionary
