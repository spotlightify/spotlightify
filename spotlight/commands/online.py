from spotipy import Spotify

from spotlight.commands.base import BaseCommand
from spotlight.manager.manager import PlaybackManager


class OnlineCommand(BaseCommand):
    def __init__(self, sp: Spotify, type="song"):
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
        self.prefix = prefix
        self.sp = sp

    def get_dicts(self, parameter: str) -> list:
        command_list = [self._command_dict]
        if parameter != "":
            try:
                command_list = []
                if self.type == "queue" or self.type == "song":
                    results = self.sp.search(q=parameter, limit=6)["tracks"]["items"]
                else:
                    results = self.sp.search(q=parameter, limit=6, type=self.type)[f"{self.type}s"]["items"]

                for item in results:
                    if self.type == "song" or self.type == "queue" or self.type == "album":
                        command_list.append(self._populate_new_dict(item["name"],
                                                                    f"By {', '.join([a['name'] for a in item['artists']])}",
                                                self.icon, item["uri"], "exe"))
                    elif self.type == "playlist":
                        command_list.append(self._populate_new_dict(item["name"],
                                                                    f"By {item['owner']['display_name']}",
                                                                    self.icon, item["uri"], "exe"))
                    elif self.type == "artist":
                        command_list.append(self._populate_new_dict(item["name"],
                                                                    'music' if len(item['genres'])==0 else item['genres'][0],
                                                                    self.icon, item["uri"], "exe"))

                if len(command_list) == 0:
                    command_list = [self._populate_new_dict("No Results Found", "Please adjust search term", "cog", "", "fill")]
            except:
                command_list = [
                    self._populate_new_dict("No Suggestions Found", "Please adjust search term",
                                            "cog", "", "fill")]
        return command_list
