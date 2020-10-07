from spotipy import Spotify

from api.playback import PlaybackFunctions
from spotlight.suggestions.playable.song import SongSuggestion
from spotlight.suggestions.menu import MenuSuggestion
from spotlight.commands.command import Command
from spotlight.suggestions.templates import WarningSuggestion, WarningFillSuggestion


class PlayingCommand(Command):
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Currently Playing", "Show currently playing song", "currently playing")
        self.sp = sp

    def get_suggestions(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        else:
            return [SongPlayingSuggestion(self.sp)]


class SongPlayingSuggestion(MenuSuggestion):
    def __init__(self, sp: Spotify):
        MenuSuggestion.__init__(self, "Currently Playing", "Show currently playing song", "play", "Currently Playing", [])
        self.sp = sp

    def refresh_menu_suggestions(self):
        song = PlaybackFunctions(self.sp).get_current_song_info()
        if song["name"] == "Nothing Currently Playing":
            self.menu_suggestions = [WarningFillSuggestion("No active device selected", "Click to select device", "device")]
        else:
            self.menu_suggestions = [PassiveSongSuggestion(f"Playing {song['name']} by {song['artist']}", "Song Currently Playing", song["image"])]


class PassiveSongSuggestion(SongSuggestion):
    def __init__(self, name, artist, image_name):
        SongSuggestion.__init__(self, name, artist, image_name, image_name)
        self.setting = "none"

