from caching.holder import CacheHolder
from spotlight.suggestions.menu import PagingSuggestions
from spotlight.suggestions.playable.album import AlbumSuggestion
from spotlight.suggestions.playable.artist import ArtistSuggestion
from spotlight.suggestions.playable.playlist import PlaylistSuggestion
from spotlight.suggestions.playable.song import SongSuggestion, QueueSuggestion
from spotlight.suggestions.templates import FillSuggestion
from spotlight.commands.command import Command


class SearchCacheCommand(Command):
    """
    Command to search for items (songs/playlists/artists/albums) in cache
    """

    def __init__(self, search_type: str):
        if search_type == "song":
            prefix = "play "
        else:
            prefix = f"{search_type} "
        Command.__init__(self, prefix, f"Search for a {search_type}", prefix)
        self.type_ = search_type

    def get_suggestions(self, parameter="") -> list:
        """

        :param parameter: parameter="song/artist/playlist/album name" <- takes this format
        :return: List of Items
        """


        if parameter == "":
            return [FillSuggestion(self.title, self.description, self.prefix[:-1], self.prefix)]

        online_item = FillSuggestion(f"Search Online for '{parameter}'", "Search Online", "search",
                                     f"🔎{self.type_} {parameter}")
        result_list, title, image, suggestion, cache, description = [online_item], \
                                                                    "name", "image", None, None, "description"

        if self.type_ == "song" or self.type_ == "queue":
            description = "artist"
            cache = CacheHolder.song_cache
            suggestion = SongSuggestion if self.type_ == "song" else QueueSuggestion
        if self.type_ == "playlist":
            description = "owner"
            cache = CacheHolder.playlist_cache
            suggestion = PlaylistSuggestion
        if self.type_ == "album":
            cache = CacheHolder.album_cache
            description = "artist"
            suggestion = AlbumSuggestion
        if self.type_ == "artist":
            cache = CacheHolder.artist_cache
            description = "genre"
            suggestion = ArtistSuggestion

        song_list = list(cache[f'{self.type_ if self.type_ != "queue" else "song"}s'].items())
        song_list = sorted(song_list, key=self.__clean_name)

        # Finds up to 21 results
        while len(result_list) <= 13:
            result = self.__binary_search(song_list, parameter)
            if result:
                key, values = song_list[result]
                new_suggestion = suggestion(values[title], values[description], values[image], key)
                result_list.append(new_suggestion)
                song_list.pop(result)
            else:
                break
        result_list = PagingSuggestions.page_suggestions(result_list)  # Puts suggestions into pages
        return result_list

    def __clean_name(self, x):
        name = x.lower() if isinstance(x, str) else x[1]["name"].lower()
        for i in [".", ",", "-", "(", ")", "'"]:
            name = name.replace(i, "")
        name = name.replace("  ", " ")
        return name

    def __binary_search(self, L, target):
        start = 0
        end = len(L) - 1

        while start <= end:
            middle = (start + end) // 2
            search = self.__clean_name(L[middle])
            target = self.__clean_name(target)

            if len(search) >= len(target) and search[:len(target)].lower() == target.lower():
                return middle

            if search.lower() > target.lower():
                end = middle - 1
            elif search.lower() < target.lower():
                start = middle + 1
