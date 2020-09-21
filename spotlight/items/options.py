from api.manager import PlaybackManager
from api.misc import MiscFunctions
from spotlight.items.item import Item
from spotlight.menu import Menu


class SongOptions:
    @staticmethod
    def create_song_options(song_name: str, artist_name: str, image_name: str, song_id):
        return [DisplaySongOption(song_name, artist_name, image_name),
                AddToQueueOption(song_name, song_id),
                SaveSongOption(song_name),
                SongRadioOption(song_name, song_id),
                AddToPlaylistOption(song_name, song_id)
                ]


class DisplaySongOption(Item):
    def __init__(self, song_name: str, artist_name: str, image_name: str):
        Item.__init__(self, f"{song_name} by {artist_name}", "Options", image_name, lambda: None,
                      "", "", "none")


class AddToQueueOption(Item):
    def __init__(self, song_name, song_id):
        Item.__init__(self, f"Add to Queue", f"Queue '{song_name}'", "list", PlaybackManager.queue_song,
                      "", song_id, "exe")

class SaveSongOption(Item):
    def __init__(self, song_name):
        Item.__init__(self, f"Save Song", f"Save '{song_name}'", "heart", PlaybackManager.toggle_like_song,
                      "", "", "exe")


class SongRadioOption(Item):
    def __init__(self, song_name, song_id):
        Item.__init__(self, f"Go to Song Radio", f"Start '{song_name}' Radio", "radio", PlaybackManager.play_recommended,
                      "", song_id, "exe")


class PlaylistItems(Menu):
    def __init__(self, song_id, song_name):
        Menu.__init__(self, f"Add to Playlist", f"Add '{song_name}' to Playlist", "playlist", "", [], fill_prefix=False)
        self.song_id = song_id
        self.pages = [[]]
        self.current_page = 0
        # misc_funcs = MiscFunctions()  # TODO: MAKE SPOTIFY OBJECT A SINGLETON CLASS

    def refresh_items(self):
        pass  # TODO: Finish this class

class AddToPlaylistOption(Item):
    def __init__(self, song_name, song_id):
        Item.__init__(self, f"Add to Playlist", f"Add '{song_name}' to Playlist", "playlist", lambda: None,
                      "", song_id, "none")
