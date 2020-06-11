from spotlight.commands.base import BaseCommand
from spotlight.manager.manager import PlaybackManager
from spotlight.manager.check import CheckFunctions
from spotipy import Spotify
# TODO: Change how the commands are updated so that there does not have to be an API call everytime a letter relavent to the command is typed

class SwitchCommand(BaseCommand):
    def __init__(self, title: str, description: str, icon: str, function: classmethod, parameter: str, prefix: str,
                 setting: str, sp: Spotify):
        BaseCommand.__init__(self, title, description, icon, function, parameter, prefix, setting)
        self.sp = sp

    def get_dicts(self, parameter: str) -> list:
        command_list = [self._switch()]
        return command_list
    
    def _switch(self):
        pass


class ShuffleCommand(SwitchCommand):
    def __init__(self, sp: Spotify):
        SwitchCommand.__init__(self, "Shuffle", "Change Shuffle State", "shuffle", PlaybackManager.toggle_shuffle, "", "shuffle", "exe", sp)
    
    def _switch(self):
        if CheckFunctions(self.sp).is_shuffle_on():
            return self._populate_new_dict("Shuffle", "Shuffle is ON. Click to switch it OFF", "shuffle", "", "exe")
        else:
            return self._populate_new_dict("Shuffle", "Shuffle is OFF. Click to switch it ON", "shuffle", "", "exe")

class LikeCommand(SwitchCommand):
    def __init__(self, sp: Spotify):
        SwitchCommand.__init__(self, "Like", "Add the current song to your liked songs", "heart", PlaybackManager.toggle_like_song, "", "like", "exe", sp)
    
    def _switch(self):
        if CheckFunctions(self.sp).is_song_liked():
            return self._populate_new_dict("Like", "The current song is not liked. Click to like", "heart-no-fill", "", "exe")
        else:
            return self._populate_new_dict("Like", "The current song is liked. Click to unlike", "heart", "", "exe")
