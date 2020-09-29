from typing import List

from caching.holder import CacheHolder
from spotlight.items.item import Item
from spotlight.items.play import SongItem, QueueItem, PlaylistItem, AlbumItem, ArtistItem
from spotlight.items.template_items import FillItem, PassiveItem
from spotlight.new_commands.command import Command


class SearchCacheCommand(Command):
    def __init__(self, search_type: str):
        if search_type == "song":
            prefix = "play "
        else:
            prefix = f"{search_type} "
        Command.__init__(self, prefix, f"Search for a {search_type}", prefix)
        self.type_ = search_type

    def get_items(self, **kwargs) -> list:
        """

        :param kwargs: parameter="song/artist/playlist/album name" <- takes this format
        :return: List of Items
        """
        parameter = kwargs["parameter"]

        if parameter == "":
            return [FillItem(self.title, self.description, self.prefix[:-1], self.prefix)]

        online_item = FillItem(f"Search Online for '{parameter}'", "Search Online", "search", f"🔎{self.type_} {parameter}")
        item_list, title, image, item, cache, description = [online_item], \
                                                            "name", "image", None, None, "description"

        if self.type_ == "song" or self.type_ == "queue":
            description = "artist"
            cache = CacheHolder.song_cache
            item = SongItem if self.type_ == "song" else QueueItem
        if self.type_ == "playlist":
            description = "owner"
            cache = CacheHolder.playlist_cache
            item = PlaylistItem
        if self.type_ == "album":
            cache = CacheHolder.album_cache
            description = "artist"
            item = AlbumItem
        if self.type_ == "artist":
            cache = CacheHolder.artist_cache
            description = "genre"
            item = ArtistItem

        for key, values in cache[f'{self.type_ if self.type_ != "queue" else "song"}s'].items():
            name = values[title]
            if len(item_list) == 6:
                break
            if len(name) >= len(parameter) and name[:len(parameter)].lower() == parameter:
                new_suggestion = item(name, values[description], values[image], key)
                item_list.append(new_suggestion)
                # TODO: Add duplicate removal system
        return item_list
