from spotipy import Spotify

from spotlight.suggestions.menu import PagingSuggestions
from spotlight.suggestions.playable.album import AlbumSuggestion
from spotlight.suggestions.playable.artist import ArtistSuggestion
from spotlight.suggestions.playable.playlist import PlaylistSuggestion
from spotlight.suggestions.playable.song import SongSuggestion, QueueSuggestion
from spotlight.suggestions.templates import WarningSuggestion
from spotlight.commands.command import Command


class SearchOnlineCommand(Command):
    """
    Command to search online for songs
    """

    def __init__(self, search_type: str, sp: Spotify):
        Command.__init__(self, "", "Search Online", f"🔎{search_type} ")
        self.sp = sp
        self.type_ = search_type

    def get_suggestions(self, parameter="") -> list:
        """
        Overrides BaseCommand get_dicts method
        :param parameter: This is the str that comes after the prefix
        :return: Returns a list of song suggestions from the online search
        """

        item_list = []
        if parameter != "":
            try:
                if self.type_ == "queue" or self.type_ == "song":
                    results = self.sp.search(q=parameter, limit=10)["tracks"]["items"]
                else:
                    results = self.sp.search(q=parameter, limit=10, type=self.type_)[f"{self.type_}s"]["items"]

                for item in results:
                    if self.type_ == "song":
                        item_list.append(
                            SongSuggestion(item["name"], f"{', '.join([a['name'] for a in item['artists']])}",
                                           "play", item["uri"]))
                    elif self.type_ == "queue":
                        item_list.append(QueueSuggestion(item["name"],
                                                         f"{', '.join([a['name'] for a in item['artists']])}",
                                                         "queue", item["uri"]))
                    elif self.type_ == "album":
                        item_list.append(AlbumSuggestion(item["name"],
                                                         f"By {', '.join([a['name'] for a in item['artists']])}",
                                                         "album", item["uri"]))
                    elif self.type_ == "playlist":
                        item_list.append(PlaylistSuggestion(item["name"], f"By {item['owner']['display_name']}",
                                                            "playlist", item["uri"]))
                    elif self.type_ == "artist":
                        item_list.append(ArtistSuggestion(item["name"],
                                                          'music' if len(item['genres']) == 0 else
                                                          item['genres'][0],
                                                          "artist", item["uri"]))
                if len(item_list) == 0:
                    item_list = [WarningSuggestion("No Results Found", "Please adjust search term")]
                else:
                    item_list = PagingSuggestions.page_suggestions(item_list)
            except:
                item_list = [WarningSuggestion("No Results Found", "Please adjust search term")]
        return item_list
