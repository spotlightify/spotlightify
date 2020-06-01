import collections
import requests
import spotipy
from os import sep, path
import json
import copy
from definitions import ASSETS_DIR, CACHE_DIR
from pathlib import Path


class Interactions:
    def __init__(self, sp: spotipy.Spotify, token_info, sp_oauth, exit_function, queue):
        self.exit_function = exit_function
        self.sp_oauth = sp_oauth
        self.sp = sp
        self.token_info = token_info
        self.queue = queue
        try:
            self.current_device_id = self.sp.devices()["devices"][0]["id"]
        except:
            print("[WARNING] No device currently available. Make sure the Spotify desktop app is open and play a song on it to "
                  "ensure that the device is discoverable. A device can be selected by typing 'device' into the Spotlightify search.")

    def exit(self):
        self.exit_function()

    def play_song(self, song_input):
        try:
            song_uri = self.get_song_uri(song_input)
            self.sp.start_playback(self.current_device_id, None, [song_uri])
        except spotipy.exceptions.SpotifyException:
            print("No device selected. Make sure the Spotify desktop app is running and the correct device has been "
                  "selected. A device can be selected by typing 'device' into the Spotlightify search.")

    def get_song_uri(self, song_input):
        song_uri = None
        try:
            song = self.sp.track(song_input)
            song_uri = song["uri"]
            self.queue.put(song)
        except:
            track = self.sp.search(song_input, limit=1, market="GB", type="track")["tracks"]["items"][0]
            song_uri = track["uri"]
            self.queue.put(track)
        return song_uri

    def is_song_playing(self):
        try:
            return self.sp.current_playback()["is_playing"]
        except:
            return False

    def toggle_playback(self, *refresh_method: classmethod):
        try:
            if self.sp.current_playback()["is_playing"]:
                self.sp.pause_playback(self.current_device_id)
            else:
                self.sp.start_playback(self.current_device_id)
            for refresh in refresh_method:  # the refresh_method arg should only contain one class method
                refresh()
        except:
            print("[ERROR] Playback could not be toggled")

    def is_shuffle_on(self):
        try:
            return self.sp.current_playback()["shuffle_state"]
        except:
            return False

    def like_song_toggle(self, *refresh_method: classmethod):  # used to immediately refresh a svg
        try:
            current_song = self.sp.current_user_playing_track()["item"]
            if not self.is_current_song_liked():
                self.sp.current_user_saved_tracks_add([current_song["uri"]])
            else:
                self.sp.current_user_saved_tracks_delete([current_song["uri"]])
            for refresh in refresh_method:  # the refresh_method arg should only contain one class method
                refresh()
        except:
            print("[ERROR] Song like could not be toggled")

    def is_current_song_liked(self):
        try:
            current_song = self.sp.currently_playing()["item"]
            if self.sp.current_user_saved_tracks_contains([current_song["id"]])[0]:
                return True
            else:
                return False
        except:
            return False

    def play_playlist(self, playlist_id):
        try:
            self.sp.start_playback(self.current_device_id, f"spotify:playlist:{playlist_id}")
        except:
            print("[ERROR] Could not play playlist")

    def goto(self, time):
        try:
            """Get Seconds from time."""
            time_standard = str(time).count(":")
            if time_standard == 1:
                time = "0:" + str(time)
            h, m, s = time.split(':')
            time = (int(h) * 3600 + int(m) * 60 + int(s)) * 1000
            self.sp.seek_track(time, self.current_device_id)
            self.resume_playback()
        except:
            print("[ERROR] Invalid time give. Valid command example: go to 1:40")

    def play_liked(self):
        try:
            results = self.sp.current_user_saved_tracks()
            tracks = results["items"]
            uris = []
            while results["next"]:
                results = self.sp.next(results)
                tracks.extend(results["items"])
            for track in tracks:
                uris.append(track["track"]["uri"])
            self.sp.start_playback(self.current_device_id, None, uris=uris)
        except:
            print("[ERROR] Could not play liked music")


    def queue_song(self, song_input):
        song_uri = self.get_song_uri(song_input)
        self.sp.add_to_queue(song_uri, self.current_device_id)

    def pause_playback(self):
        try:
            self.sp.pause_playback(self.current_device_id)
        except:
            print("[WARNING] Could not pause playback")

    def resume_playback(self):
        try:
            self.sp.start_playback(self.current_device_id)
        except:
            print("[WARNING] Could not resume playback")

    def next_song(self, *refresh_method: classmethod):
        try:
            self.sp.next_track(self.current_device_id)
            for refresh in refresh_method:  # the refresh_method arg should only contain one class method
                refresh()
        except:
            print("Sorry, this is the Last Track in the Queue")

    def previous_song(self, *refresh_method: classmethod):
        try:
            self.sp.previous_track(self.current_device_id)
            for refresh in refresh_method:  # the refresh_method arg should only contain one class method
                refresh()
        except:
            print("Sorry, previous song not found")

    def is_int(self, value):
        try:
            int(str(value).strip())
            return True
        except ValueError:
            return False

    def perform_command(self, command, parent):
        self.refresh_token()
        if command["visual"] == 1 and command["parameter"] == 1:
            command["function"](self, parent, command["term"])
        elif command["visual"] == 0 and command["parameter"] == 1:
            command["function"](self, command["term"])
        elif command["visual"] == 0 and command["parameter"] == 0:
            command["function"](self)
        elif command["visual"] == 1 and command["parameter"] == 0:
            command["function"](self, parent)

    def command_match(self, term):
        matched = []
        og_parameter = term
        for command in self.command_list.values():
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
                            elif command["title"] == "Device":
                                matched = self.get_device_suggestions(command, parameter)
                        elif command["parameter"] == 1:
                            new_command = copy.deepcopy(command)
                            new_command["exe_on_return"] = 1
                            new_command["term"] = parameter
                            matched.append(new_command)
                        break
        if len(matched) == 0:
            matched = self.get_song_suggestions(self.command_list["Play"], og_parameter)
        return matched

    def command_perform(self, command, parent):
        self.refresh_token()
        if command["visual"] == 1 and command["parameter"] == 1:
            command["function"](self, parent, command["term"])
        elif command["visual"] == 0 and command["parameter"] == 1:
            command["function"](self, command["term"])
        elif command["visual"] == 0 and command["parameter"] == 0:
            command["function"](self)
        elif command["visual"] == 1 and command["parameter"] == 0:
            command["function"](self, parent)

    def download_image(self, path, url, id_):
        img_data = requests.get(url).content
        with open(path + id_ + '.jpg', 'wb') as handler:
            handler.write(img_data)

    def get_device_suggestions(self, command, term):
        matched = []
        devices = self.sp.devices()["devices"]
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

    def get_json_cache(file):
        # takes string param file: "songs" will create songs.json with "{ songs: [], length: 0 }"
        file_path = f"{CACHE_DIR}{file}.json"
        if not Path(file_path).exists():
            # creates file if it doesn't exist
            with open(file_path, "w") as f:
                json.dump({f"{file}": [], "length": 0}, f)
                return file_path  # returns file path to json file

    def get_playlist_suggestions(self, command, term):
        with open(playlist_cache_file_path, 'r') as f:
            data = json.load(f)
            matched = []
            for playlist in data["playlists"]:
                if len(matched) >= 6:
                    break
                elif len(playlist["name"]) >= len(term):
                    if playlist["name"][:len(term)].lower() == term:
                        new_command = copy.deepcopy(command)
                        new_command["icon"] = playlist["image"]
                        new_command["title"] = playlist["name"]
                        new_command["description"] = f"By {playlist['owner']}"
                        new_command["term"] = f"{playlist['uri']}"
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

    def get_playlist_suggestions(self, command, term):
        if not path.isfile(playlist_cache_file_path):
            return []
        with open(playlist_cache_file_path, 'r') as f:
            data = json.load(f)
            matched = []
            for playlist_id, values in data["playlists"].items():
                if len(matched) >= 6:
                    break
                if len(values["name"]) >= len(term):
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

    def refresh_token(self):
        try:
            if self.sp_oauth.is_token_expired(token_info=self.token_info):
                self.token_info = self.sp_oauth.refresh_access_token(self.token_info['refresh_token'])
                token = self.token_info['access_token']
                self.sp = spotipy.Spotify(auth=token)
        except:
            print("[WARNING] Could not refresh user API token")

    def set_device(self, device_id):
        self.pause_playback()
        self.current_device_id = device_id

    def set_vol(self, value):
        try:
            int_ = int(value)
            if 0 <= int_ <= 100:
                self.sp.volume(int_, self.current_device_id)
        except:
            print("[ERROR] Invalid volume value. Valid command example: 'volume 20'")

    def toggle_like_song(self, *refresh_method: classmethod):  # used to immediately refresh a svg
        try:
            current_song = self.sp.current_user_playing_track()["item"]
            if not self.is_current_song_liked():
                self.sp.current_user_saved_tracks_add([current_song["uri"]])
            else:
                self.sp.current_user_saved_tracks_delete([current_song["uri"]])
            for refresh in refresh_method:  # the refresh_method arg should only contain one class method
                refresh()
        except:
            print("[ERROR] Could not toggle Save to your Liked Songs")

    def toggle_playback(self, *refresh_method: classmethod):
        try:
            if self.sp.current_playback()["is_playing"]:
                self.sp.pause_playback(self.current_device_id)
            else:
                self.sp.start_playback(self.current_device_id)
            for refresh in refresh_method:  # the refresh_method arg should only contain one class method
                refresh()
        except:
            print("[ERROR] Could not toggle playback. Make a device has been selected. Use the 'device' command to select"
                  " the appropriate device")

    def toggle_shuffle(self, *refresh_method: classmethod):
        try:
            if self.is_shuffle_on():
                self.sp.shuffle(False, self.current_device_id)
                self.command_list["Shuffle"]["title"] = "Shuffle (ON)"
            else:
                self.sp.shuffle(True, self.current_device_id)
                self.command_list["Shuffle"]["title"] = "Shuffle (OFF)"
            for refresh in refresh_method:  # the refresh_method arg should only contain one class method
                refresh()
        except:
            print("[ERROR] Could not toggle shuffle")

    # add a space after prefixes
    command_list = \
        {"Play": {"title": "Play", "description": "Plays a song", "prefix": ["play "], "function": play_song,
                  "icon": f"{ASSETS_DIR}svg{sep}play.svg", "visual": 0, "parameter": 1, "match_change": 1,
                  "exe_on_return": 0,
                  "term": ""},
         "Queue": {"title": "Queue", "description": "Adds a song to the queue", "prefix": ["queue "],
                   "function": queue_song, "icon": f"{ASSETS_DIR}svg{sep}list.svg", "visual": 0, "parameter": 1,
                   "match_change": 1,
                   "exe_on_return": 0, "term": ""},
         "Pause": {"title": "Pause", "description": "Pauses currently playing music", "prefix": ["pause ", "stop "],
                   "function": pause_playback, "icon": f"{ASSETS_DIR}svg{sep}pause.svg", "visual": 0, "parameter": 0,
                   "match_change": 0, "exe_on_return": 1},
         "Playlist": {"title": "Playlist", "description": "Plays a playlist", "prefix": ["playlist "],
                      "function": play_playlist, "icon": f"{ASSETS_DIR}svg{sep}playlist.svg", "visual": 0, "parameter": 1,
                      "match_change": 1, "exe_on_return": 0, "term": ""},
         "Liked": {"title": "Liked", "description": "Plays liked music", "prefix": ["liked "], "function": play_liked,
                   "icon": f"{ASSETS_DIR}svg{sep}heart.svg", "visual": 0, "parameter": 0, "match_change": 0,
                   "exe_on_return": 1},
         "Volume": {"title": "Volume", "description": "Changes music volume (1-100)", "prefix": ["volume "],
                    "function": set_vol, "icon": f"{ASSETS_DIR}svg{sep}volume.svg", "visual": 0, "parameter": 1,
                    "match_change": 0,
                    "exe_on_return": 0, "term": ""},
         "Goto": {"title": "Go to", "description": "Skips to time e.g. 3:41", "prefix": ["goto ", "go to "],
                  "function": goto, "icon": f"{ASSETS_DIR}svg{sep}forward.svg", "visual": 0, "parameter": 1,
                  "match_change": 0,
                  "exe_on_return": 0, "term": ""},
         "Resume": {"title": "Resume", "description": "Resumes music playback", "prefix": ["resume ", "start "],
                    "function": resume_playback, "icon": f"{ASSETS_DIR}svg{sep}play.svg", "visual": 0, "parameter": 0,
                    "match_change": 0, "exe_on_return": 1},
         "Skip": {"title": "Skip", "description": "Skips the current song", "prefix": ["skip ", "next "],
                  "function": next_song, "icon": f"{ASSETS_DIR}svg{sep}forward.svg", "visual": 0, "parameter": 0,
                  "match_change": 0,
                  "exe_on_return": 1},
         "Previous": {"title": "Previous", "description": "Plays previous song", "prefix": ["previous "],
                      "function": previous_song, "icon": f"{ASSETS_DIR}svg{sep}backward.svg", "visual": 0, "parameter": 0,
                      "match_change": 0, "exe_on_return": 1},
         "Exit": {"title": "Exit", "description": "Exit Spotlightify", "prefix": ["exit ","quit "],
                  "function": exit, "icon": f"{ASSETS_DIR}svg{sep}moon.svg", "visual": 0, "parameter": 0,
                  "match_change": 0, "exe_on_return": 1},
         "Shuffle": {"title": r"Shuffle (OFF)", "description": "Toggles shuffle mode", "prefix": ["shuffle "],
                     "function": toggle_shuffle, "icon": f"{ASSETS_DIR}svg{sep}shuffle.svg", "visual": 0, "parameter": 0,
                     "match_change": 0, "exe_on_return": 1},
         "Device": {"title": r"Device", "description": "Select device to play music from", "prefix": ["device "],
                    "function": set_device, "icon": f"{ASSETS_DIR}svg{sep}device.svg", "visual": 0, "parameter": 1,
                    "match_change": 1, "exe_on_return": 0}
         }


# File Names
song_cache_file_path = f"{CACHE_DIR}songs.json"
playlist_cache_file_path = f"{CACHE_DIR}playlists.json"
album_cache_file_path = f"{CACHE_DIR}albums.json"
artist_cache_file_path = f"{CACHE_DIR}artists.json"
album_art_path = f"{CACHE_DIR}art{sep}"
