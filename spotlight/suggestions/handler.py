from queue import Queue
from spotipy import Spotify

from spotlight.suggestions.commands.base import BaseCommand
from spotlight.suggestions.suggestion import Suggestion
from spotlight.suggestions.commands.device import DeviceCommand
from caching.holder import CacheHolder
from spotlight.suggestions.commands.online import OnlineCommand
from spotlight.suggestions.commands.template_commands import ParameterCommand
from spotlight.suggestions.commands.play import PlaylistCommand, SongCommand, AlbumCommand, ArtistCommand, QueueCommand
from spotlight.suggestions.commands.playing import PlayingCommand
from spotlight.suggestions.commands.change import ShuffleCommand, LikeCommand, RepeatCommand
from spotlight.manager.manager import PlaybackManager


class CommandHandler:
    def __init__(self, sp: Spotify, queue: Queue):
        self.command_list = [SongCommand(),
                             QueueCommand(),
                             PlaylistCommand(),
                             AlbumCommand(),
                             ArtistCommand(),
                             PlayingCommand(sp),
                             ShuffleCommand(sp),
                             LikeCommand(sp),
                             OnlineCommand(sp, type="song"),
                             OnlineCommand(sp, type="queue"),
                             OnlineCommand(sp, type="artist"),
                             OnlineCommand(sp, type="playlist"),
                             OnlineCommand(sp, type="album"),
                             ParameterCommand("Go to", "Seeks a position in the current song, i.e. 1:40", "forward",
                                              PlaybackManager.goto, "", "go to "),
                             ParameterCommand("Volume", "Sets the volume of your Spotify Player in range 1-10",
                                              "volume",
                                              PlaybackManager.set_volume, "", "volume "),
                             DeviceCommand(sp),
                             BaseCommand("Pause", "Pauses playback", "pause", PlaybackManager.pause, "", "pause",
                                         "exe"),
                             BaseCommand("Resume", "Resumes playback", "play", PlaybackManager.resume, "", "resume",
                                         "exe"),
                             RepeatCommand(),
                             BaseCommand("Skip", "Skips to the next song", "forward", PlaybackManager.skip, "", "skip",
                                         "exe"),
                             BaseCommand("Previous", "Plays the previous song", "backward", PlaybackManager.previous,
                                         "", "previous", "exe"),
                             BaseCommand("Saved", "Plays liked music", "heart", PlaybackManager.play_liked, "", "saved",
                                         "exe"),
                             BaseCommand("Exit", "Exit the application", "exit", PlaybackManager.exit_app, "", "exit",
                                         "exe"),
                             BaseCommand("Share", "Copy song URL to clipboard", "share", PlaybackManager.copy_url_to_clipboard, "", "share", "exe")
                             ]
        self.sp = sp
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
            if len(text) <= len(prefix):
                if prefix == text and type(command).__name__ == "Menu":
                    suggestions.extend(command.get_items(text))
                elif prefix.startswith(text):
                    suggestions.extend(command.get_items())
            else:
                if text.startswith(prefix):
                    parameter = text[len(prefix):]
                    suggestions.extend(command.get_items(parameter))
        if not suggestions:  # gets song suggestions if no other matches are found
            suggestions = self.command_list[0].get_items(text)
        return suggestions

    def perform_command(self, command: Suggestion):
        """
        Executes a command
        :param command: Suggestion object
        :return:
        """
        try:
            if command.parameter == "":
                command.function(self.manager)
            else:
                command.function(self.manager, command.parameter)
        except:
            print("[Error] Command failed to execute")
