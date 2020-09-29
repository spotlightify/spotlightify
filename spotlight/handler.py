from queue import Queue
from spotipy import Spotify

from auth import AuthUI
from spotlight.menu import Menu
from spotlight.new_commands.change import LikeCommand, RepeatCommand, ShuffleCommand
from spotlight.new_commands.playback import ResumeCommand, PreviousCommand, PauseCommand, NextCommand
from spotlight.new_commands.playing import PlayingCommand
from spotlight.new_commands.search_online import SearchOnlineCommand
from spotlight.new_commands.search_songs import SearchCacheCommand
from spotlight.suggestion import Suggestion
from spotlight.commands.device import DeviceCommand
from caching.holder import CacheHolder
from spotlight.commands.online import OnlineCommand
from spotlight.commands.template_commands import ParameterCommand
from spotlight.commands.play import PlaylistCommand, SongCommand, AlbumCommand, ArtistCommand, QueueCommand
from api.manager import PlaybackManager


class CommandHandler:
    def __init__(self, sp: Spotify, queue: Queue):
        self.sp = sp
        self.auth_ui = AuthUI()
        self.command_list = [SearchCacheCommand("song"),
                             SearchCacheCommand("artist"),
                             SearchCacheCommand("album"),
                             SearchCacheCommand("playlist"),
                             SearchOnlineCommand("song", sp),
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
                             PauseCommand()
                             ]
        # self.command_list = [SongCommand(),
        #                      QueueCommand(),
        #                      PlaylistCommand(),
        #                      AlbumCommand(),
        #                      ArtistCommand(),
        #                      PlayingCommand(sp),
        #                      ShuffleCommand(sp),
        #                      LikeCommand(sp),
        #                      Command("Authentication", "Enter Spotify API details", "cog", lambda: None,
        #                              "", "authentication", "exe"),
        #                      OnlineCommand(sp, type="song"),
        #                      OnlineCommand(sp, type="queue"),
        #                      OnlineCommand(sp, type="artist"),
        #                      OnlineCommand(sp, type="playlist"),
        #                      OnlineCommand(sp, type="album"),
        #                      ParameterCommand("Go to", "Seeks a position in the current song, i.e. 1:40", "forward",
        #                                       PlaybackManager.goto, "", "go to "),
        #                      ParameterCommand("Volume", "Sets the volume of your Spotify Player in range 1-10",
        #                                       "volume",
        #                                       PlaybackManager.set_volume, "", "volume "),
        #                      DeviceCommand(sp),
        #                      Command("Pause", "Pauses playback", "pause", PlaybackManager.pause, "", "pause",
        #                                  "exe"),
        #                      Command("Resume", "Resumes playback", "play", PlaybackManager.resume, "", "resume",
        #                                  "exe"),
        #                      RepeatCommand(),
        #                      Command("Skip", "Skips to the next song", "forward", PlaybackManager.skip, "", "skip",
        #                                  "exe"),
        #                      Command("Previous", "Plays the previous song", "backward", PlaybackManager.previous,
        #                                  "", "previous", "exe"),
        #                      Command("Saved", "Plays liked music", "heart", PlaybackManager.play_liked, "", "saved",
        #                                  "exe"),
        #                      Command("Exit", "Exit the application", "exit", PlaybackManager.exit_app, "", "exit",
        #                                  "exe"),
        #                      Command("Share", "Copy song URL to clipboard", "share", PlaybackManager.copy_url_to_clipboard, "", "share", "exe")
        #                      ]
        self.manager = PlaybackManager(sp, queue)
        self.manager.set_device("")  # Sets default device
        CacheHolder.reload_holder("all")

    def get_command_suggestions(self, text: str) -> list:
        """
        Used to return a list of Suggestion objects to be displayed
        :param text: Text from textbox widget on GUI
        :return: list of Suggestion objects corresponding to the text parameter
        """
        CacheHolder.check_reload("all")  # Reloads cached items if time since last reload has surpassed 5 minutes
        suggestions = []
        for command in self.command_list:
            prefix = command.prefix
            if prefix.startswith(text) or text.startswith(prefix):
                if issubclass(command.__class__, Menu):
                    if len(prefix) >= len(text):
                        if text > prefix:
                            parameter = text[len(prefix):]
                        else:
                            parameter = ""
                        suggestions.extend(command.get_items(parameter=parameter))
                else:
                    if text > prefix:
                        parameter = text[len(prefix):]
                    else:
                        parameter = ""
                    suggestions.extend(command.get_items(parameter=parameter))
        if not suggestions:  # gets song suggestions if no other matches are found
            suggestions = self.command_list[0].get_items(parameter=text)
        return suggestions

    def perform_command(self, command: Suggestion):
        """
        Executes a command
        :param command: Suggestion object
        :return:
        """
        try:
            if command.title == "Authentication":
                self.auth_ui.show()
            elif command.parameter == "":
                command.function(self.manager)
            else:
                command.function(self.manager, command.parameter)
        except:
            print("[Error] Command failed to execute")
