import json
from queue import Queue
from spotipy import Spotify
from spotlight.commands.base import BaseCommand
from spotlight.commands.holder import CacheHolder
from spotlight.commands.play import PlayCommand, SongCommand
from spotlight.manager.manager import PlaybackManager
from os import sep
from definitions import CACHE_DIR


class CommandHandler:
    def __init__(self, sp: Spotify, queue: Queue):
        self.command_list = [SongCommand(),
                             BaseCommand("Pause", "Pauses playback", "pause", PlaybackManager.pause, "", "pause", "exe"),
                             BaseCommand("Resume", "Resumes playback", "play", PlaybackManager.resume, "", "resume", "exe"),
                             BaseCommand("Skip", "Skips to the next song", "forward", PlaybackManager.skip, "", "skip", "exe"),
                             BaseCommand("Previous", "Plays the previous song", "backward", PlaybackManager.previous, "", "previous", "exe")]
        self.manager = PlaybackManager(sp, queue)
        CacheHolder.refresh_holder("all")

    def get_command_suggestions(self, text: str) -> list:
        suggestions = []
        for command in self.command_list:
            prefix = command.prefix
            if len(text) <= len(prefix):
                if text == prefix[:len(text)]:
                    suggestions.extend(command.get_dicts(""))
            else:
                if prefix == text[:len(prefix)]:
                    parameter = text[len(prefix):]
                    suggestions.extend(command.get_dicts(parameter))
        return suggestions

    def perform_command(self, command: dict):
        if command["parameter"] == "":
            command["function"](self.manager)
        else:
            command["function"](self.manager, command["parameter"])
