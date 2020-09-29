from spotipy import Spotify

from api.manager import PlaybackManager
from api.playback import PlaybackFunctions
from spotlight.items.play import SongItem
from spotlight.menu import Menu
from spotlight.new_commands.command import Command


class PlayingCommand(Command):
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Currently Playing", "Show currently playing song", "currently playing")
        self.sp = sp

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        else:
            return [SongPlayingItem(self.sp)]


class SongPlayingItem(Menu):
    def __init__(self, sp: Spotify):
        Menu.__init__(self, "Currently Playing", "Show currently playing song", "play", "Currently Playing", [])
        self.sp = sp

    def refresh_menu_items(self):
        song = PlaybackFunctions(self.sp).get_current_song_info()
        self.menu_items = [PassiveSongItem(f"Playing {song['name']} by {song['artist']}", "Song Currently Playing", song["image"])]


class PassiveSongItem(SongItem):
    def __init__(self, name, artist, image_name):
        SongItem.__init__(self, name, artist, image_name, image_name)
        self.setting = "none"

