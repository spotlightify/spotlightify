from spotlight.suggestions.commands.command import Command
from spotlight.suggestions.items.item import Item
from spotlight.suggestions.suggestion import Suggestion
from spotlight.suggestions.menu import Menu
from spotlight.manager.manager import PlaybackManager
from spotlight.manager.check import CheckFunctions
from spotipy import Spotify

# Dedicated to suggestions which change

class ShuffleCommand(Command):
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Shuffle", "Change Shuffle State", "shuffle", PlaybackManager.toggle_shuffle, "",
                               "shuffle", "exe")
        self.sp = sp
        # The rate limiter requires the same is_song_liked method to run for it to properly limit API requests
        self.check_shuffle = CheckFunctions(self.sp).is_shuffle_on

    def get_items(self, parameter="") -> list:
        shuffle = self.check_shuffle()
        self.description = "Shuffle is ON. Click to turn OFF" if shuffle else "Shuffle is OFF. Click to turn ON"
        return super(ShuffleCommand, self).get_items(parameter)


class LikeCommand(Command):
    def __init__(self, sp: Spotify):
        Command.__init__(self, "Like", "Add the current song to your liked songs", "heart",
                         PlaybackManager.toggle_like_song, "", "like", "exe")
        self.sp = sp
        # The rate limiter requires the same is_song_liked method to run for it to properly limit API requests
        self.liked = CheckFunctions(self.sp).is_song_liked

    def get_items(self, parameter="") -> list:
        liked = self.liked()
        self.description = "Remove the current song from your Liked Songs" if liked else "Save the current song to your Liked Songs"
        self.icon_name = "heart" if liked else "heart-no-fill"
        return super(LikeCommand, self).get_items(parameter)


class RepeatCommand(Menu):
    def __init__(self):
        items = [RepeatItem(s) for s in ["off", "context", "track"]]
        Menu.__init__(self, "Repeat", "Change the repeat state of your spotify player", "repeat", "repeat", items)


class RepeatItem(Item):
    def __init__(self, state: str):
        title = f"{state[0].upper()}{state[1:]}"
        description = f"Set repeat state to {state}"
        Item.__init__(self, title, description, "repeat", PlaybackManager.toggle_repeat, "", state, "exe")
