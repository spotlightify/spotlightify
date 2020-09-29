from spotipy import Spotify

from spotlight.items.play import SongItem, QueueItem, PlaylistItem, AlbumItem, ArtistItem
from spotlight.items.template_items import WarningItem
from spotlight.new_commands.command import Command


class SearchOnlineCommand(Command):
    def __init__(self, search_type: str, sp: Spotify):
        Command.__init__(self, "", "Search Online", f"🔎{search_type} ")
        self.sp = sp
        self.type_ = search_type

    def get_items(self, **kwargs) -> list:
        """
        Overrides BaseCommand get_dicts method
        :param parameter: This is the str that comes after the prefix
        :return: Returns a list of command dictionaries of items from the online search
        """
        parameter = kwargs["parameter"]
        item_list = []
        if parameter != "":
            try:
                if self.type_ == "queue" or self.type_ == "song":
                    results = self.sp.search(q=parameter, limit=6)["tracks"]["items"]
                else:
                    results = self.sp.search(q=parameter, limit=6, type=self.type_)[f"{self.type_}s"]["items"]

                for item in results:
                    if self.type_ == "song":
                        item_list.append(
                            SongItem(item["name"], f"{', '.join([a['name'] for a in item['artists']])}",
                                     "play", item["uri"]))
                    elif self.type_ == "queue":
                        item_list.append(QueueItem(item["name"],
                                                   f"{', '.join([a['name'] for a in item['artists']])}",
                                                   "queue", item["uri"]))
                    elif self.type_ == "album":
                        item_list.append(AlbumItem(item["name"],
                                                   f"By {', '.join([a['name'] for a in item['artists']])}",
                                                   "album", item["uri"]))
                    elif self.type_ == "playlist":
                        item_list.append(PlaylistItem(item["name"], f"By {item['owner']['display_name']}",
                                                      "playlist", item["uri"]))
                    elif self.type_ == "artist":
                        item_list.append(ArtistItem(item["name"],
                                                    'music' if len(item['genres']) == 0 else
                                                    item['genres'][0],
                                                    "artist", item["uri"]))

                if len(item_list) == 0:
                    item_list = [WarningItem("No Results Found", "Please adjust search term")]
            except:
                item_list = [WarningItem("No Results Found", "Please adjust search term")]
        return item_list
