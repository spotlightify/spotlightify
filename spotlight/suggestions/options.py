from math import ceil
from os import getenv

from api.manager import PlaybackManager
from caching.holder import CacheHolder
from spotlight.suggestions.suggestion import Suggestion
from spotlight.suggestions.item import Item
from spotlight.suggestions.templates import PassiveSuggestion
from spotlight.suggestions.menu import MenuSuggestion


class OptionItem(Suggestion):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str,
                 setting: str):
        Suggestion.__init__(self, title, description, icon, function, parameter, prefix, setting)
        self.option_items = []


class SongOptions:
    @staticmethod
    def create_song_options(song_name: str, artist_name: str, image_name: str, song_id):
        return [DisplaySongOptionSuggestion(song_name, artist_name, image_name),
                AddToQueueOptionSuggestion(song_name, song_id),
                SaveSongOptionSuggestion(song_name),
                SongRadioOptionSuggestion(song_name, song_id),
                AddToPlaylistOptionSuggestion(song_name, song_id, artist_name, image_name),
                ShareSongOptionSuggestion(song_id)
                ]


class DisplaySongOptionSuggestion(PassiveSuggestion):
    def __init__(self, song_name: str, artist_name: str, image_name: str):
        PassiveSuggestion.__init__(self, f"{song_name} by {artist_name}", "Options", image_name)


class AddToQueueOptionSuggestion(Suggestion):
    def __init__(self, song_name, song_id):
        Suggestion.__init__(self, f"Add to Queue", f"Queue '{song_name}'", "list", PlaybackManager.queue_song,
                      "", song_id, "exe")


class SaveSongOptionSuggestion(Suggestion):
    def __init__(self, song_name):
        Suggestion.__init__(self, f"Save Song", f"Save '{song_name}'", "heart", PlaybackManager.toggle_like_song,
                      "", "", "exe")


class SongRadioOptionSuggestion(Suggestion):
    def __init__(self, song_name, song_id):
        Suggestion.__init__(self, f"Go to Song Radio", f"Start '{song_name}' Radio", "radio", PlaybackManager.play_recommended,
                      "", song_id, "exe")


class AddToPlaylistOptionSuggestion(MenuSuggestion):
    def __init__(self, song_name, song_id, artist_name, image_name):
        MenuSuggestion.__init__(self, f"Add to Playlist", f"Add '{song_name}' to Playlist", "playlist", "", [], fill_prefix=False)
        self.song_id = song_id
        self.song_name = song_name
        self.artist_name = artist_name
        self.image_name = image_name
        self.current_page = 0

    def refresh_menu_items(self):
        # get relevant info from playlists
        playlists = []
        for key, value in CacheHolder.playlist_cache["playlists"].items():
            if value["owner"] == getenv('SPOTIFY_USERNAME'):  # TODO Change to something more solid e.g. singleton
                playlists.append({"name": value["name"], "id": key})

        # create pages list
        len_ = len(playlists)
        num_pages = ceil(len_/4)
        back_item = MenuSuggestion("Back", f"Page 1 of {num_pages}", "exit", "",
                                   SongOptions.create_song_options(self.song_name, self.artist_name, self.image_name, self.song_id),
                                   fill_prefix=False)
        pages = [[]]
        pages[0].append(back_item)
        playlist_index = 0
        for i in range(0, num_pages):
            if i != 0:
                pages.append([])
                pages[i].append(PlaylistPageChangeSuggestion("previous", pages, i, num_pages))
            for a in range(0, 4 if (len_ - 1 - playlist_index > 4) else (len_ - playlist_index - 1)):
                playlist = playlists[playlist_index]
                playlist_index += 1
                ids = {"song": self.song_id, "playlist": playlist["id"]}
                pages[i].append(Item(playlist["name"], f"Add to {playlist['name']}", playlist['id'],
                                     PlaybackManager.add_to_playlist, "", ids, "exe"))
            if i != num_pages - 1:
                pages[i].append(PlaylistPageChangeSuggestion("next", pages, i, num_pages))

        self.menu_items = pages[0]


class PlaylistPageChangeSuggestion(MenuSuggestion):
    def __init__(self, navigation: str, pages: list, page_index: int, num_pages):
        """
        Used for navigation
        :param navigation: either "next", "previous" or "back"
        :param page_index: index of last page shown
        """
        MenuSuggestion.__init__(self, "Next Page" if navigation == "next" else "Previous Page",
                      f"Page {page_index + 1} of {num_pages}", "forward" if navigation == "next" else "backward",
                      "", [], fill_prefix=False)
        self.navigation = navigation
        self.pages = pages
        self.page_index = page_index

    def refresh_menu_items(self):
        if self.navigation == "next":
            self.menu_items = self.pages[self.page_index + 1]
        else:
            self.menu_items = self.pages[self.page_index - 1]


class ShareSongOptionSuggestion(Suggestion):
    def __init__(self, song_id):
        Suggestion.__init__(self, f"Share Song URL", f"Copy URL to Clipboard", "share", PlaybackManager.copy_url_to_clipboard,
                      "", song_id, "exe")
