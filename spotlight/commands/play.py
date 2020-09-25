from caching.holder import CacheHolder
from api.manager import PlaybackManager
from spotlight.commands.command import Command
from spotlight.items.play import SongItem, QueueItem, PlaylistItem, AlbumItem, ArtistItem
from spotlight.items.template_items import FillItem, WarningItem


class PlayCommand(Command):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str,
                 setting: str, _type: str):
        Command.__init__(self, title, description, icon, function, parameter, prefix, setting)
        self._type = _type

    def get_items(self):
        suggestions = super(PlayCommand, self).get_items()
        parameter = self.parameter
        if parameter != "":
            try:
                suggestions = [FillItem(f'Search Online "{parameter}"',
                                        f"Searches for {self._type if self._type != 'queue' else 'song'} online",
                                        "search",
                                        f"🔎{self._type} {parameter}")]
                suggestions.extend(self._get_item_suggestions(parameter))
            except:
                suggestions = [WarningItem("Caching in progress...", "Please wait until items have been cached")]
        return suggestions

    def binary_search(self, L, target):
        start = 0
        end = len(L) - 1

        while start < end:
            middle = (start + end)// 2

            key, values = L[middle]
            name = values["name"]
            search = name.lower()

            removables = ["@", "'", '"', "¡", "!", "#", "$", "%", ".", ","]
            for i in removables:
                search = search.replace(i, "")
            if len(search)>=len(target) and search[:len(target)].lower() == target.lower():
                return middle

            if search > target:
                end = middle - 1 
            elif search < target:
                start = middle + 1

    def _get_item_suggestions(self, parameter: str) -> list:
        suggestions, title, image, item, cache, description = [], "name", "image", None, None, "description"

        if self._type == "song" or self._type == "queue":
            description = "artist"
            cache = CacheHolder.song_cache
            item = SongItem if self._type == "song" else QueueItem
        if self._type == "playlist":
            description = "owner"
            cache = CacheHolder.playlist_cache
            item = PlaylistItem
        if self._type == "album":
            cache = CacheHolder.album_cache
            description = "artist"
            item = AlbumItem
        if self._type == "artist":
            cache = CacheHolder.artist_cache
            description = "genre"
            item = ArtistItem

        L = list(cache[f'{self._type if self._type != "queue" else "song"}s'].items())
        
         while len(suggestions)<5:
            result = self.binary_search(L, parameter)
            if result:
                key, values = L[result]
                new_suggestion = item(values[title], values[description], values[image], key)
                suggestions.append(new_suggestion)
                L.pop(result)
            else:
                break
        return suggestions

class SongCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Play", "Plays a song", "play", PlaybackManager.play_song,
                             "", "play ", "fill", "song")


class QueueCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Queue", "Adds a song to the queue", "list", PlaybackManager.queue_song,
                             "", "queue ", "fill", "queue")


class PlaylistCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Playlist", "Plays a playlist", "playlist", PlaybackManager.play_playlist,
                             "", "playlist ", "fill", "playlist")


class AlbumCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Album", "Plays an album", "album", PlaybackManager.play_album,
                             "", "album ", "fill", "album")


class ArtistCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Artist", "Plays an artist", "artist", PlaybackManager.play_artist,
                             "", "artist ", "fill", "artist")
