from queue import Queue
from spotipy import Spotify

from auth import AuthUI

from spotlight.suggestions.menu import MenuSuggestion
from spotlight.commands.change import LikeCommand, RepeatCommand, ShuffleCommand
from spotlight.commands.device import DeviceCommand
from spotlight.commands.misc import VolumeCommand, GoToCommand, ExitCommand, ShareCommand, AuthenticationCommand
from spotlight.commands.playback import ResumeCommand, PreviousCommand, PauseCommand, NextCommand, SavedCommand
from spotlight.commands.playing import PlayingCommand
from spotlight.commands.search_online import SearchOnlineCommand
from spotlight.commands.search_songs import SearchCacheCommand
from spotlight.suggestions.suggestion import Suggestion
from caching.holder import CacheHolder
from api.manager import PlaybackManager


class CommandHandler:
    def __init__(self, sp: Spotify, queue: Queue):
        self.sp = sp
        self.auth_ui = AuthUI()
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
                             LikeCommand(sp),
                             RepeatCommand(),
                             ShuffleCommand(sp),
                             PlayingCommand(sp),
                             ResumeCommand(),
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
        self.manager.set_device("")  # Sets default device
        CacheHolder.reload_holder("all")

    def get_command_suggestions(self, text: str) -> list:
        """
        Used to return a list of Suggestion objects to be displayed
        :param text: Text from textbox widget on GUI
        :return: list of Suggestion objects corresponding to the text parameter
        """
        CacheHolder.check_reload("all")  # Reloads cached suggestions if time since last reload has surpassed 5 minutes
        suggestions = []
        if text == "":
            return []
        for command in self.command_list:
            prefix = command.prefix
            if prefix.startswith(text) or text.startswith(prefix):
                if issubclass(command.__class__, MenuSuggestion):
                    if len(prefix) >= len(text):
                        if text > prefix:
                            parameter = text[len(prefix):]
                        else:
                            parameter = ""
                        suggestions.extend(command.get_suggestions(parameter=parameter))
                else:
                    if text > prefix:
                        parameter = text[len(prefix):]
                    else:
                        parameter = ""
                    suggestions.extend(command.get_suggestions(parameter=parameter))
        if not suggestions:  # gets song suggestions if no other matches are found
            suggestions = self.command_list[0].get_suggestions(parameter=text)
        return suggestions

    def perform_command(self, item: Suggestion):
        """
        Executes a command
        :param command: Suggestion object
        :return:
        """
        try:
            if item.title == "Authentication":
                self.auth_ui.show()
            elif item.parameter == "":
                item.function(self.manager)
            else:
                item.function(self.manager, item.parameter)
        except:
            print("[Error] Command failed to execute")
