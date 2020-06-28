from spotipy import Spotify

from spotlight.suggestions.commands.base import BaseCommand
from spotlight.suggestions.suggestion import Suggestion
from spotlight.suggestions.items.play import SongItem, QueueItem, AlbumItem, PlaylistItem, ArtistItem
from spotlight.suggestions.items.template_items import WarningItem
from spotlight.manager.manager import PlaybackManager


class OnlineCommand(BaseCommand):
    def __init__(self, sp: Spotify, type="song"):
        """
        Allows user to search online for songs/albums/artists/playlists/queue-songs
        :param sp: Spotify object from the spotipy library
        :param type: str of value 'song', 'queue', 'artist', 'playlist' or 'album'
        """
        # creates command and class variables
        func = PlaybackManager.play_song
        icon = "play"
        prefix = "🔎song "
        noun = type
        if type == "queue":
            func = PlaybackManager.queue_song
            icon = "list"
            prefix = "🔎queue "
            noun = "song"
        elif type == "playlist":
            func = PlaybackManager.play_playlist
            icon = type
            prefix = "🔎playlist "
            noun = type
        elif type == "album":
            func = PlaybackManager.play_album
            icon = type
            prefix = "🔎album "
            noun = type
        elif type == "artist":
            func = PlaybackManager.play_artist
            icon = type
            prefix = "🔎artist "
            noun = type
        BaseCommand.__init__(self, "Search", f"Searches for {noun} online", icon, func, "", prefix, "fill")
        self.type = type
        self.icon = icon
        self.sp = sp

    def get_items(self, parameter="") -> list:
        """
        Overrides BaseCommand get_dicts method
        :param parameter: This is the str that comes after the prefix
        :return: Returns a list of command dictionaries of items from the online search
        """
        command_list = [self]
        if parameter != "":
            try:
                command_list = []
                if self.type == "queue" or self.type == "song":
                    results = self.sp.search(q=parameter, limit=6)["tracks"]["items"]
                else:
                    results = self.sp.search(q=parameter, limit=6, type=self.type)[f"{self.type}s"]["items"]

                for item in results:
                    if self.type == "song":
                        command_list.append(
                            SongItem(item["name"], f"{', '.join([a['name'] for a in item['artists']])}",
                                     self.icon, item["uri"]))
                    elif self.type == "queue":
                        command_list.append(QueueItem(item["name"],
                                                      f"{', '.join([a['name'] for a in item['artists']])}",
                                                      self.icon, item["uri"]))
                    elif self.type == "album":
                        command_list.append(AlbumItem(item["name"],
                                                      f"By {', '.join([a['name'] for a in item['artists']])}",
                                                      self.icon, item["uri"]))
                    elif self.type == "playlist":
                        command_list.append(PlaylistItem(item["name"], f"By {item['owner']['display_name']}",
                                                         self.icon, item["uri"]))
                    elif self.type == "artist":
                        command_list.append(ArtistItem(item["name"],
                                                       'music' if len(item['genres']) == 0 else
                                                       item['genres'][0],
                                                       self.icon, item["uri"]))

                if len(command_list) == 0:
                    command_list = [WarningItem("No Results Found", "Please adjust search term")]
            except:
                command_list = [WarningItem("No Results Found", "Please adjust search term")]
        return command_list
