from spotlight.suggestions.commands.base import BaseCommand
from spotlight.suggestions.suggestion import Suggestion
from caching.holder import CacheHolder
from spotlight.suggestions.items.play import SongItem, QueueItem, PlaylistItem, AlbumItem, ArtistItem
from spotlight.suggestions.items.template_items import FillItem, WarningItem
from spotlight.manager.manager import PlaybackManager


class PlayCommand(BaseCommand):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str,
                 setting: str, _type: str):
        BaseCommand.__init__(self, title, description, icon, function, parameter, prefix, setting)
        self._type = _type

    def get_items(self, parameter=""):
        suggestions = [self]
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

    def _get_item_suggestions(self, parameter: str) -> list:
        suggestions, title, image, item, cache = [], "name", "image", None, None

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

        for key, values in cache[f'{self._type if self._type != "queue" else "song"}s'].items():
            name = values[title]
            if len(suggestions) == 5:
                break
            if len(name) >= len(parameter) and name[:len(parameter)].lower() == parameter:
                new_suggestion = item(name, values[description], values[image], key)
                suggestions.append(new_suggestion)
                # TODO: Add duplicate removal system
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
