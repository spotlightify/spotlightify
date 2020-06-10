import json
from queue import Queue
from spotipy import Spotify
from spotlight.commands.base import BaseCommand
from spotlight.commands.device import DeviceCommand
from spotlight.commands.holder import CacheHolder
from spotlight.commands.parameter import ParameterCommand
from spotlight.commands.play import PlaylistCommand, SongCommand, AlbumCommand, ArtistCommand, QueueCommand
from spotlight.commands.playing import PlayingCommand
from spotlight.manager.manager import PlaybackManager
from os import sep
from definitions import CACHE_DIR


class CommandHandler:
    def __init__(self, sp: Spotify, queue: Queue, sp_oauth):
        self.command_list = [SongCommand(),
                             QueueCommand(),
                             PlaylistCommand(),
                             AlbumCommand(),
                             ArtistCommand(),
                             PlayingCommand(sp),
                             ParameterCommand("Go to", "Seeks a position in the current song, i.e. 1:40", "forward",
                                              PlaybackManager.goto, "", "go to ", "fill"),
                             ParameterCommand("Volume", "Sets the volume of your Spotify Player in range 1-10",
                                              "volume",
                                              PlaybackManager.set_volume, "", "volume ", "fill"),
                             DeviceCommand(sp),
                             BaseCommand("Pause", "Pauses playback", "pause", PlaybackManager.pause, "", "pause",
                                         "exe"),
                             BaseCommand("Resume", "Resumes playback", "play", PlaybackManager.resume, "", "resume",
                                         "exe"),
                             BaseCommand("Skip", "Skips to the next song", "forward", PlaybackManager.skip, "", "skip",
                                         "exe"),
                             BaseCommand("Previous", "Plays the previous song", "backward", PlaybackManager.previous,
                                         "", "previous", "exe"),
                             BaseCommand("Liked", "Plays liked music", "heart", PlaybackManager.play_liked, "", "liked",
                                         "exe"),
                             BaseCommand("Exit", "Exit the application", "moon", PlaybackManager.exit_app, "", "exit",
                                         "exe")]
        self.sp_oauth = sp_oauth
        self.sp = sp
        self.refresh_token()
        self.manager = PlaybackManager(sp, queue)
        self.manager.set_device("")  # Sets default device
        CacheHolder.reload_holder("all")

    def get_command_suggestions(self, text: str) -> list:
        CacheHolder.check_reload_time("all")  # Reloads cached items
        self.refresh_token()
        suggestions = []
        for command in self.command_list:
            prefix = command.prefix
            if len(text) <= len(prefix):
                if prefix.startswith(text):
                    suggestions.extend(command.get_dicts(""))
            else:
                if text.startswith(prefix):
                    parameter = text[len(prefix):]
                    suggestions.extend(command.get_dicts(parameter))
        if not suggestions:  # gets song suggestions if no other matches are found
            suggestions = self.command_list[0].get_dicts(text)
        return suggestions

    def perform_command(self, command: dict):
        if command["parameter"] == "":
            command["function"](self.manager)
        else:
            command["function"](self.manager, command["parameter"])

    def refresh_token(self):
        try:
            token_info = self.sp_oauth.get_access_token(as_dict=True)
            if self.sp_oauth.is_token_expired(token_info=token_info):
                token_info = self.sp_oauth.refresh_access_token(token_info['refresh_token'])
                token = token_info['access_token']
                self.sp = Spotify(auth=token)
        except:
            print("[WARNING] Could not refresh user API token")
