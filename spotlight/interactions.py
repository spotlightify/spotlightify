import collections
import spotipy
from os import sep, path
import json
import copy
from spotlight.manager.manager import PlaybackManager
from definitions import ASSETS_DIR, CACHE_DIR


class Interactions:
    command_list = \
        {"Play": {"title": "Play", "description": "Plays a song", "prefix": ["play "],
                  "function": PlaybackManager.play_song,
                  "icon": f"{ASSETS_DIR}svg{sep}play.svg", "visual": 0, "parameter": 1, "match_change": 1,
                  "exe_on_return": 0,
                  "term": ""},
         "Queue": {"title": "Queue", "description": "Adds a song to the queue", "prefix": ["queue "],
                   "function": PlaybackManager.queue_song, "icon": f"{ASSETS_DIR}svg{sep}list.svg", "visual": 0,
                   "parameter": 1,
                   "match_change": 1,
                   "exe_on_return": 0, "term": ""},
         "Pause": {"title": "Pause", "description": "Pauses currently playing music", "prefix": ["pause ", "stop "],
                   "function": PlaybackManager.pause, "icon": f"{ASSETS_DIR}svg{sep}pause.svg", "visual": 0,
                   "parameter": 0,
                   "match_change": 0, "exe_on_return": 1},
         "Playlist": {"title": "Playlist", "description": "Plays a playlist", "prefix": ["playlist "],
                      "function": PlaybackManager.play_playlist, "icon": f"{ASSETS_DIR}svg{sep}playlist.svg",
                      "visual": 0,
                      "parameter": 1,
                      "match_change": 1, "exe_on_return": 0, "term": ""},
         "Album": {"title": "Album", "description": "Plays an album", "prefix": ["album "],
                    "function": PlaybackManager.play_album, "icon": f"{ASSETS_DIR}svg{sep}album.svg",
                    "visual": 0,
                    "parameter": 1,
                    "match_change": 1, "exe_on_return": 0, "term": ""},
         "Artist": {"title": "Artist", "description": "Plays an artist's discography", "prefix": ["artist "],
                    "function": PlaybackManager.play_artist, "icon": f"{ASSETS_DIR}svg{sep}artist.svg",
                    "visual": 0,
                    "parameter": 1,
                    "match_change": 1, "exe_on_return": 0, "term": ""},
         "Liked": {"title": "Liked", "description": "Plays liked music", "prefix": ["liked "],
                   "function": PlaybackManager.play_liked,
                   "icon": f"{ASSETS_DIR}svg{sep}heart.svg", "visual": 0, "parameter": 0, "match_change": 0,
                   "exe_on_return": 1},
         "Volume": {"title": "Volume", "description": "Changes music volume (1-10)", "prefix": ["volume "],
                    "function": PlaybackManager.set_volume, "icon": f"{ASSETS_DIR}svg{sep}volume.svg", "visual": 0,
                    "parameter": 1,
                    "match_change": 0,
                    "exe_on_return": 0, "term": ""},
         "Goto": {"title": "Go to", "description": "Skips to time e.g. 3:41", "prefix": ["goto ", "go to "],
                  "function": PlaybackManager.goto, "icon": f"{ASSETS_DIR}svg{sep}forward.svg", "visual": 0,
                  "parameter": 1,
                  "match_change": 0,
                  "exe_on_return": 0, "term": ""},
         "Resume": {"title": "Resume", "description": "Resumes music playback", "prefix": ["resume ", "start "],
                    "function": PlaybackManager.resume, "icon": f"{ASSETS_DIR}svg{sep}play.svg", "visual": 0,
                    "parameter": 0,
                    "match_change": 0, "exe_on_return": 1},
         "Skip": {"title": "Skip", "description": "Skips the current song", "prefix": ["skip ", "next "],
                  "function": PlaybackManager.skip, "icon": f"{ASSETS_DIR}svg{sep}forward.svg", "visual": 0,
                  "parameter": 0,
                  "match_change": 0,
                  "exe_on_return": 1},
         "Previous": {"title": "Previous", "description": "Plays previous song", "prefix": ["previous "],
                      "function": PlaybackManager.previous, "icon": f"{ASSETS_DIR}svg{sep}backward.svg",
                      "visual": 0,
                      "parameter": 0,
                      "match_change": 0, "exe_on_return": 1},
         "Exit": {"title": "Exit", "description": "Exit Spotlightify", "prefix": ["exit ", "quit "],
                  "function": PlaybackManager.exit,
                  "icon": f"{ASSETS_DIR}svg{sep}moon.svg", "visual": 0, "parameter": 1,
                  "match_change": 0, "exe_on_return": 1},
         "Shuffle": {"title": r"Shuffle", "description": "Shuffle is (OFF). Click to change to (ON)", "prefix": ["shuffle "],
                     "function": PlaybackManager.toggle_shuffle, "icon": f"{ASSETS_DIR}svg{sep}shuffle.svg",
                     "visual": 0,
                     "parameter": 0,
                     "match_change": 0, "exe_on_return": 1},
         "Device": {"title": r"Device", "description": "Select device to play music from", "prefix": ["device"],
                    "function": PlaybackManager.set_device, "icon": f"{ASSETS_DIR}svg{sep}device.svg", "visual": 0,
                    "parameter": 1,
                    "match_change": 1, "exe_on_return": 0},
         "Repeat": {"title": r"Repeat", "description": "Repeat is (OFF). Click to change to (ALL)",
                    "prefix": ["repeat"],
                    "function": PlaybackManager.toggle_repeat, "icon": f"{ASSETS_DIR}svg{sep}repeat.svg",
                    "visual": 0,
                    "parameter": 0, "match_change": 0,
                    "exe_on_return": 1},
         "Currently": {"title": r"Current Song", "description": "Gets the current song",
                    "prefix": ["currently playing"],
                    "function": None, "icon": f"{ASSETS_DIR}svg{sep}repeat.svg",
                    "visual": 0,
                    "parameter": 0, "match_change": 1,
                    "exe_on_return": 0}
         }

    def __init__(self, sp: spotipy.Spotify, token_info, sp_oauth, exit_function, queue):
        self.manager = PlaybackManager(sp, queue)
        self.manager.set_device("")
        self.sp_oauth = sp_oauth
        # assigns exit function
        Interactions.command_list["Exit"]["term"] = exit_function
        self.sp = sp
        self.token_info = token_info
        self.queue = queue
        try:
            self.current_device_id = self.sp.devices()["devices"][0]["id"]
        except:
            print("[WARNING] No device currently available. Make sure the Spotify desktop app is open and play a song on it to "
                  "ensure that the device is discoverable. A device can be selected by typing 'device' into the Spotlightify search.")

    def perform_command(self, command, parent):
        self.refresh_token()
        if command["visual"] == 1 and command["parameter"] == 1:
            command["function"](self.manager, parent, command["term"])
        elif command["visual"] == 0 and command["parameter"] == 1:
            command["function"](self.manager, command["term"])
        elif command["visual"] == 0 and command["parameter"] == 0:
            command["function"](self.manager)
        elif command["visual"] == 1 and command["parameter"] == 0:
            command["function"](self.manager, parent)

    def command_match(self, term):
        matched = []
        og_parameter = term
        for command in Interactions.command_list.values():
            for prefix in command["prefix"]:
                if len(matched) >= 6:
                    break
                elif len(term) <= len(prefix):
                    if command["title"] == "Device" and prefix == og_parameter:
                        matched = self.get_device_suggestions(command, og_parameter)
                    elif term == prefix[:len(term)]:
                        matched.append(command)
                        break
                elif len(term) > len(prefix):
                    if prefix == term[:len(prefix)]:
                        parameter = og_parameter.replace(prefix, "", 1)
                        if command["match_change"] == 1:
                            if command["title"] == "Play" or command["title"] == "Queue":
                                matched = self.get_song_suggestions(command, parameter)
                            elif command["title"] == "Playlist":
                                matched = self.get_playlist_suggestions(command, parameter)
                            elif command["title"] == "Album":
                                matched = self.get_album_suggestions(command, parameter)
                            elif command["title"] == "Artist":
                                matched = self.get_artist_suggestions(command, parameter)
                            elif command["title"] == "Device":
                                matched = self.get_device_suggestions(command, parameter)
                            elif command["title"] == "Currently":
                                matched = self.get_device_suggestions(command, parameter)
                        elif command["parameter"] == 1:
                            new_command = copy.deepcopy(command)
                            new_command["exe_on_return"] = 1
                            new_command["term"] = parameter
                            matched.append(new_command)
                        break
        if len(matched) == 0:
            matched = self.get_song_suggestions(Interactions.command_list["Play"], og_parameter)
        return matched

    def get_device_suggestions(self, command, term):
        matched = []
        devices = self.manager.get_devices()
        for device in devices:
            if len(matched) >= 6:
                break
            else:
                new_command = copy.deepcopy(command)
                new_command["title"] = device["name"]
                new_command["description"] = f"{device['type']}"
                new_command["term"] = f"{device['id']}"
                new_command["exe_on_return"] = 1
                matched.append(new_command)
        # for sorting commands into alphabetical order
        matched_sorted = sorted(matched, key=lambda k: k["title"])
        return matched_sorted
    
    def get_currently_playing(self):
        command = copy.deepcopy(Interactions.command_list["Currently"])
        current_song = self.manager.current_song()
        command["title"] = f"Playing {current_song['name']}"
        command["description"] = f"Playing {current_song['artist']}"
        return command

    def get_playlist_suggestions(self, command, term):
        with open(playlist_cache_file_path, 'r') as f:
            data = json.load(f)
            matched = []
            for playlist_id, values in data["playlists"].items():
                if len(matched) >= 6:
                    break
                elif len(values["name"]) >= len(term):
                    if values["name"][:len(term)].lower() == term:
                        new_command = copy.deepcopy(command)
                        new_command["icon"] = f'{album_art_path}{values["image"]}.jpg'
                        new_command["title"] = values["name"]
                        new_command["description"] = f"By {values['owner']}"
                        new_command["term"] = f"{playlist_id}"
                        new_command["exe_on_return"] = 1
                        matched.append(new_command)
        # for sorting commands into alphabetical order
        matched_sorted = sorted(matched, key=lambda k: k["title"])
        return matched_sorted

    def get_album_suggestions(self, command, term):
        with open(album_cache_file_path, 'r') as f:
            data = json.load(f)
            matched = []
            for album_id, values in data["albums"].items():
                if len(matched) >= 6:
                    break
                if len(values["name"]) >= len(term):
                    if values["name"][:len(term)].lower() == term:
                        new_command = copy.deepcopy(command)
                        new_command["icon"] = f'{album_art_path}{values["image"]}.jpg'
                        new_command["title"] = values["name"]
                        new_command["description"] = f"By {values['artist']}"
                        new_command["term"] = f"{album_id}"
                        new_command["exe_on_return"] = 1
                        matched.append(new_command)
        # for sorting commands into alphabetical order
        matched_sorted = sorted(matched, key=lambda k: k["title"])
        return matched_sorted

    def get_artist_suggestions(self, command, term):
        with open(artist_cache_file_path, 'r') as f:
            data = json.load(f)
            matched = []
            for artist_id, values in data["artists"].items():
                if len(matched) >= 6:
                    break
                if len(values["name"]) >= len(term):
                    if values["name"][:len(term)].lower() == term:
                        new_command = copy.deepcopy(command)
                        new_command["icon"] = f'{album_art_path}{values["image"]}.jpg'
                        new_command["title"] = values["name"]
                        new_command["description"] = f"{values['genre']}"
                        new_command["term"] = f"{artist_id}"
                        new_command["exe_on_return"] = 1
                        matched.append(new_command)
        # for sorting commands into alphabetical order
        matched_sorted = sorted(matched, key=lambda k: k["title"])
        return matched_sorted

    def get_song_suggestions(self, command, term):
        def check_for_duplicates():
            if len(matched) > 1:
                for match in matched:
                    if new_command["title"] == match["title"]:
                        artists1 = new_command["description"].split(",")
                        artists2 = match["description"].split(",")
                        if collections.Counter(artists1) == collections.Counter(artists2):
                            return True
            return False

        first_command = copy.deepcopy(command)
        first_command["title"] = f'{command["title"]} "{term}"'
        first_command["exe_on_return"] = 1
        first_command["term"] = term
        matched = [first_command]
        if not path.isfile(song_cache_file_path):
            return [first_command]
        try:
            with open(song_cache_file_path, 'r') as f:
                data = json.load(f)
                for song_id, values in data["songs"].items():
                    if len(matched) >= 6:
                        break
                    if len(values["name"]) >= len(term):
                        if values["name"][:len(term)].lower() == term:
                            new_command = copy.deepcopy(command)
                            new_command["icon"] = f'{album_art_path}{values["image"]}.jpg'
                            new_command["title"] = values["name"]
                            new_command["description"] = f"By {values['artist']}"
                            new_command["term"] = f"{song_id}"
                            new_command["exe_on_return"] = 1
                            if not check_for_duplicates():
                                matched.append(new_command)
        except:
            None
        # for sorting commands into alphabetical order
        matched_sorted = [first_command]
        matched.remove(first_command)
        matched_sorted.extend(sorted(matched, key=lambda k: k["title"]))
        return matched_sorted

    def refresh_token(self):
        try:
            if self.sp_oauth.is_token_expired(token_info=self.token_info):
                self.token_info = self.sp_oauth.refresh_access_token(self.token_info['refresh_token'])
                token = self.token_info['access_token']
                self.sp = spotipy.Spotify(auth=token)
        except:
            print("[WARNING] Could not refresh user API token")



# File Names
song_cache_file_path = f"{CACHE_DIR}songs.json"
playlist_cache_file_path = f"{CACHE_DIR}playlists.json"
album_cache_file_path = f"{CACHE_DIR}albums.json"
artist_cache_file_path = f"{CACHE_DIR}artists.json"
album_art_path = f"{CACHE_DIR}art{sep}"
