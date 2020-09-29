from spotipy import Spotify

from api.check import CheckFunctions
from api.manager import PlaybackManager
from spotlight.items.item import Item
from spotlight.items.template_items import ExecutableItem
from spotlight.menu import Menu
from spotlight.new_commands.command import Command


class LikeCommand(Command):
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Like", "Add the currently playing song to Saved playlist", "like")
        self.sp = sp
        # The rate limiter requires the same is_song_liked method to run for it to properly limit API requests
        self.liked = CheckFunctions(self.sp).is_song_liked

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        liked = self.liked()
        item_list = []
        if liked:
            item_list.append(
                ExecutableItem("Unlike", "Remove the currently playing song from your Liked Songs", "heart-no-fill",
                               PlaybackManager.toggle_like_song))
        else:
            item_list.append(
                ExecutableItem("Like", "Add the currently playing song to your Liked Songs", "heart",
                               PlaybackManager.toggle_like_song))
        return item_list


class RepeatCommand(Command):
    def __init__(self):
        Command.__init__(self, "Repeat", "Change the repeat state of your Spotify player", "repeat")

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        items = [ExecutableItem(s, f"Set repeat state to {s.upper()}", "repeat", PlaybackManager.toggle_repeat)
                 for s in ["off", "context", "track"]]
        return [Menu(self.title, self.description, "repeat", "repeat", items)]


class ShuffleCommand(Command):
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Shuffle", "Change Shuffle State", "shuffle")
        self.sp = sp
        # The rate limiter requires the same is_shuffle_on method to run for it to properly limit API requests
        self.check_shuffle = CheckFunctions(self.sp).is_shuffle_on

    def get_items(self, **kwargs):
        if kwargs["parameter"] != "":
            return []
        if self.check_shuffle:
            current_state, next_state = "ON", "OFF"
        else:
            current_state, next_state = "OFF", "ON"
        return [ExecutableItem("Shuffle", f"Shuffle is {current_state}. Turn {next_state}", "shuffle", PlaybackManager.toggle_shuffle)]

