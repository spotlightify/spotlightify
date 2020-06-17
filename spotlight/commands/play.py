from collections import Counter
from copy import deepcopy
from spotlight.commands.base import BaseCommand
from definitions import ASSETS_DIR, CACHE_DIR
from spotlight.commands.holder import CacheHolder
from spotlight.manager.manager import PlaybackManager
from os import sep


class PlayCommand(BaseCommand):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str,
                 setting: str):
        BaseCommand.__init__(self, title, description, icon, function, parameter, prefix, setting)

    def get_dicts(self, parameter: str) -> list:
        command_list = [self._command_dict]
        if parameter != "":
            try:
                command_list = self._get_item_suggestions(parameter)
                if len(command_list) == 0:
                    command_list = [self._populate_new_dict("No Results Found", "Please adjust search term", "exit", "", "fill")]
            except KeyError:
                command_list = [
                    self._populate_new_dict("Caching in progress...", "Please wait until items have been cached",
                                            "sun", "", "fill")]
        return command_list

    def _get_item_suggestions(self, parameter: str) -> list:  # Override this
        pass


class SongCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Play", "Plays a song", "play", PlaybackManager.play_song,
                             "", "play ", "fill")

    def get_dicts(self, parameter: str) -> list:
        command_list = [self._command_dict]
        if parameter != "":
            try:
                command_list = [
                    self._populate_new_dict(f'Play "{parameter}"', "Plays a song", "play", parameter, "exe")]
                command_list.extend(self._get_item_suggestions(parameter))
            except:
                command_list = [
                    self._populate_new_dict("Caching in progess...", "Please wait until items have been cached",
                                            "cog", "", "fill")]
        return command_list

    def _get_item_suggestions(self, parameter: str) -> list:
        suggestions = []
        for key, values in CacheHolder.song_cache['songs'].items():
            name = values["name"]
            if len(suggestions) == 5:
                break
            if len(name) >= len(parameter):
                if name[:len(parameter)].lower() == parameter:
                    new_suggestion = self._populate_new_dict(name, f"By {values['artist']}", values["image"], key,
                                                             "exe")
                    # prevents duplicate songs - this may need refined in the future
                    if all([False if Counter(new_suggestion["description"].split(",")) == Counter(
                            x["description"].split(",")) else True for x in suggestions]):
                        suggestions.append(new_suggestion)

        suggestions_sorted = sorted(suggestions, key=lambda k: k["title"])
        return suggestions_sorted


class QueueCommand(SongCommand):
    def __init__(self):
        SongCommand.__init__(self)
        self.prefix = "queue "
        self._populate_command_dict("Queue", "Queues a song", "list", PlaybackManager.queue_song, "", "queue ", "fill")

    def get_dicts(self, parameter: str) -> list:
        command_list = [self._command_dict]
        if parameter != "":
            try:
                command_list = [self._populate_new_dict(f'Queue "{parameter}"', "Queues a song", "list", parameter, "exe")]
                command_list.extend(self._get_item_suggestions(parameter))
            except KeyError:
                command_list = [self._populate_new_dict("Caching in progess...", "Please wait until items have been cached",
                                                       "cog", "", "fill")]
        return command_list


class PlaylistCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Playlist", "Plays a playlist", "playlist", PlaybackManager.play_playlist,
                             "", "playlist ", "fill")

    def _get_item_suggestions(self, parameter: str) -> list:
        suggestions = []
        for key, values in CacheHolder.playlist_cache['playlists'].items():
            name = values["name"]
            if len(suggestions) == 5:
                break
            if len(name) >= len(parameter):
                if name[:len(parameter)].lower() == parameter:
                    new_suggestion = self._populate_new_dict(name, f"By {values['owner']}", values["image"], key, "exe")
                    suggestions.append(new_suggestion)
        suggestions_sorted = sorted(suggestions, key=lambda k: k["title"])
        return suggestions_sorted


class AlbumCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Album", "Plays an album", "album", PlaybackManager.play_album,
                             "", "album ", "fill")

    def _get_item_suggestions(self, parameter: str) -> list:
        suggestions = []
        for key, values in CacheHolder.album_cache['albums'].items():
            name = values["name"]
            if len(suggestions) == 5:
                break
            if len(name) >= len(parameter):
                if name[:len(parameter)].lower() == parameter:
                    new_suggestion = self._populate_new_dict(name, f"By {values['artist']}", values["image"], key,
                                                             "exe")
                    suggestions.append(new_suggestion)
        suggestions_sorted = sorted(suggestions, key=lambda k: k["title"])
        return suggestions_sorted


class ArtistCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Artist", "Plays an artist", "artist", PlaybackManager.play_artist,
                             "", "artist ", "fill")

    def _get_item_suggestions(self, parameter: str) -> list:
        suggestions = []
        for key, values in CacheHolder.artist_cache['artists'].items():
            name = values["name"]
            if len(suggestions) == 5:
                break
            if len(name) >= len(parameter):
                if name[:len(parameter)].lower() == parameter:
                    new_suggestion = self._populate_new_dict(name, f"{values['genre']}", key, key, "exe")
                    suggestions.append(new_suggestion)
        suggestions_sorted = sorted(suggestions, key=lambda k: k["title"])
        return suggestions_sorted
