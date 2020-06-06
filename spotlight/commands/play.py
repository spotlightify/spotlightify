import collections
from copy import deepcopy
from spotlight.commands.base import BaseCommand
from definitions import ASSETS_DIR, CACHE_DIR
from spotlight.commands.holder import CacheHolder
from spotlight.manager.manager import PlaybackManager
from os import sep


class PlayCommand(BaseCommand):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str, setting: str):
        BaseCommand.__init__(self, title, description, icon, function, parameter, prefix, setting)

    def _populate_new_dict(self, title, description, icon_name, parameter, setting) -> dict:
        new_dict = deepcopy(self._command_dict)
        new_dict["title"] = title
        new_dict["description"] = description
        if not len(icon_name) > 20:
            new_dict["icon"] = f"{ASSETS_DIR}svg{sep}{icon_name}.svg"
        else:
            new_dict["icon"] = f"{CACHE_DIR}art{sep}{icon_name}.jpg"
        new_dict["parameter"] = parameter
        new_dict["setting"] = setting
        return new_dict

    def get_dicts(self, parameter: str) -> list:
        command_list = []
        if parameter != "":
            command_list.extend(self.__get_item_suggestions(parameter))
        return command_list

    def __get_item_suggestions(self, parameter: str) -> list:
        pass


class SongCommand(PlayCommand):
    def __init__(self):
        PlayCommand.__init__(self, "Play", "Plays a song", "play", PlaybackManager.play_song,
                         "", "play ", "fill")

    def get_dicts(self, parameter: str) -> list:
        command_list = [self._command_dict]
        if parameter != "":
            command_list = [self._populate_new_dict(f'Play "{parameter}"', "Plays a song", "play", parameter, "exe")]
            command_list.extend(self.__get_item_suggestions(parameter))
        return command_list

    def __get_item_suggestions(self, parameter: str) -> list:
        def check_for_duplicates(suggestion: dict):
            if len(suggestions) > 1:
                for item in suggestions:
                    if item["title"] == item["title"]:
                        artists1 = suggestion["description"].split(",")
                        artists2 = item["description"].split(",")
                        if collections.Counter(artists1) == collections.Counter(artists2):
                            return True
            return False
        suggestions = []
        for key, values in CacheHolder.song_cache['songs'].items():
            name = values["name"]
            if len(suggestions) == 5:
                print("this ran")
                break
            if len(name) >= len(parameter):
                if name[:len(parameter)].lower() == parameter:
                    new_suggestion = self._populate_new_dict(name, f"By {values['artist']}", values["image"], key, "exe")
                    if not check_for_duplicates(new_suggestion):
                        suggestions.append(new_suggestion)

        suggestions_sorted = sorted(suggestions, key=lambda k: k["title"])
        print(len(CacheHolder.song_cache["songs"]))
        return suggestions_sorted
