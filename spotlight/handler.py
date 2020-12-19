from queue import Queue
from spotipy import Spotify

from auth import AuthUI

from spotlight.commands.change import LikeCommand, RepeatCommand, ShuffleCommand
from spotlight.commands.device import DeviceCommand
from spotlight.commands.misc import VolumeCommand, GoToCommand, ExitCommand, ShareCommand, AuthenticationCommand
from spotlight.commands.playback import ResumeCommand, PreviousCommand, PauseCommand, NextCommand, SavedCommand
from spotlight.commands.playing import PlayingCommand
from spotlight.commands.search_online import SearchOnlineCommand
from spotlight.commands.search_cache import SearchCacheCommand
from spotlight.suggestions.suggestion import Suggestion

from caching.holder import CacheHolder

from api.manager import PlaybackManager


class CommandHandler:
    """
    Handles commands and output suggestions for the Spotlight UI
    """
    def __init__(self, sp: Spotify, queue: Queue):
        self.sp = sp
        self.auth_ui = AuthUI()
        # store commands in a list
        # sp needed for some commands for some API functions i.e. check the state of song shuffle
        self.command_list = [SearchCacheCommand("song"),
                             SearchCacheCommand("queue"),
                             SearchCacheCommand("artist"),
                             SearchCacheCommand("album"),
                             SearchCacheCommand("playlist"),
                             SearchOnlineCommand("song", sp),
                             SearchOnlineCommand("queue", sp),
                             SearchOnlineCommand("artist", sp),
                             SearchOnlineCommand("album", sp),
                             SearchOnlineCommand("playlist", sp),
                             ResumeCommand(),
                             LikeCommand(sp),
                             RepeatCommand(),
                             ShuffleCommand(sp),
                             PlayingCommand(sp),
                             PreviousCommand(),
                             NextCommand(),
                             PauseCommand(),
                             VolumeCommand(),
                             GoToCommand(),
                             DeviceCommand(sp),
                             SavedCommand(),
                             ShareCommand(),
                             AuthenticationCommand(),
                             ExitCommand()
                             ]

        self.manager = PlaybackManager(sp, queue)
        # TODO create a settings json to store things like default device
        self.manager.set_device("")  # sets device to first available
        CacheHolder.reload_holder("all")  # Initially loads the cache into memory

    def get_command_suggestions(self, text: str) -> list:
        """
        Used to return a list of Suggestion objects to be displayed
        :param text: Text from textbox widget on Spotlight UI
        :return: list of Suggestion objects corresponding to the text parameter
        """
        CacheHolder.check_reload("all")  # Reloads cached suggestions if time since last reload has surpassed 5 minutes
        suggestions = []
        if text == "":
            return suggestions
        for command in self.command_list:
            prefix = command.prefix
            if prefix.startswith(text) or text.startswith(prefix):
                if text > prefix:
                    parameter = text[len(prefix):]
                else:
                    parameter = ""
                suggestions.extend(command.get_suggestions(parameter=parameter))
        if not suggestions:  # gets song suggestions if no other matches are found
            suggestions = self.command_list[0].get_suggestions(parameter=text)
        return suggestions

    def execute_function(self, suggestion: Suggestion):
        """
        Executes a command
        :param suggestion: Suggestion Object
        """
        try:
            if suggestion.title == "Authentication":  # opens Auth UI, needs changed at some point
                self.auth_ui.show()
            elif suggestion.parameter == "":  # executes Suggestion's function
                suggestion.function(self.manager)
            else:  # executes Suggestion's function with a string parameter
                suggestion.function(self.manager, suggestion.parameter)
        except:
            print("[Error] Command failed to execute")
