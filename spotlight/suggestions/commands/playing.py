from spotlight.suggestions.items.template_items import FillItem, WarningItem, WarningFillItem
from spotlight.suggestions.menu import Menu
from spotlight.manager.playback import PlaybackFunctions
from spotipy import Spotify
from spotlight.suggestions.suggestion import Suggestion


class PlayingCommand(Menu):
    def __init__(self, sp: Spotify):
        Menu.__init__(self, "Currently Playing", "Displays the song which is currently playing", "play", "currently playing", [])
        self.sp = sp

    def refresh_items(self):
        song = PlaybackFunctions(self.sp).get_current_song_info()
        try:
            item = FillItem(f"Playing {song['name']}", f"By {song['artist']}", song["image"], song["name"])
        except KeyError:
            item = WarningFillItem("No Device Selected", "Click here select a device", "device")
        self.menu_items = [item]



class PlayingItem(Suggestion):
    def __init__(self, song_name, artists, image):
        Suggestion.__init__(self, "", "", "", lambda: None, "", "none")
