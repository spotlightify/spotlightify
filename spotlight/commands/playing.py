from spotipy import Spotify

from api.playback import PlaybackFunctions
from spotlight.suggestions.play import SongSuggestion
from spotlight.suggestions.menu import MenuSuggestion
from spotlight.commands.command import Command


class PlayingCommand(Command):
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Currently Playing", "Show currently playing song", "currently playing")
        self.sp = sp

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        else:
            return [SongPlayingItem(self.sp)]


class SongPlayingItem(MenuSuggestion):
    def __init__(self, sp: Spotify):
        MenuSuggestion.__init__(self, "Currently Playing", "Show currently playing song", "play", "Currently Playing", [])
        self.sp = sp

    def refresh_menu_items(self):
        song = PlaybackFunctions(self.sp).get_current_song_info()
        self.menu_items = [PassiveSongSuggestion(f"Playing {song['name']} by {song['artist']}", "Song Currently Playing", song["image"])]


class PassiveSongSuggestion(SongSuggestion):
    def __init__(self, name, artist, image_name):
        SongSuggestion.__init__(self, name, artist, image_name, image_name)
        self.setting = "none"

