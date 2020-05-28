import requests
import spotipy
# from fuzzywuzzy import fuzz
import os
import subprocess
import json
import copy
import config
from definitions import ASSETS_DIR, CACHE_DIR, ROOT_DIR
from pathlib import Path


def get_json_cache(file):
    # takes string param file: "songs" will create songs.json with "{ songs: [], length: 0 }"
    file_path = f"{CACHE_DIR}{os.path.sep}{file}.json"
    if not Path(file_path).exists():
        # creates file if it doesn't exist
        with open(file_path, "w") as f:
            json.dump({f"{file}": [], "length": 0}, f)
    return file_path  # returns file path to json file


class Interactions:
    def __init__(self, sp: spotipy.Spotify, username, client_id, client_secret, scope, redirect_uri):
        self.sp = sp
        self.username = username
        self.client_id = client_id
        self.client_secret = client_secret
        self.scope = scope
        self.redirect_uri = redirect_uri
        self.current_device_id = self.sp.devices()["devices"][0]["id"]
        # Feature Toggles
        self.shuffle = False
        self.shuffle_text = "(OFF)"
        self.cache_playlists()

    def play_song(self, song_input):
        song_uri = self.get_song_uri(song_input)
        self.sp.start_playback(self.current_device_id, None, [song_uri])
        self.sp.shuffle(False, self.current_device_id)
        self.cache_playlists()

    def get_song_uri(self, song_input):
        track = None
        song_uri = None
        if "spotify:track:" in song_input:  # if the song_input is already a uri
            song_uri = song_input
            track = self.sp.track(song_uri)
            self.add_song_to_json(track)
        else:
            track = self.sp.search(song_input, limit=1, market="GB", type="track")["tracks"]["items"][0]
            self.add_song_to_json(track)
            song_uri = track["uri"]
        return song_uri

    def add_song_to_json(self, song):
        filename = song_cache_file_path
        with open(filename, 'r') as f:
            data = json.load(f)
            artists = []
            for song_cache in data["songs"]:
                if song_cache["uri"] == song["uri"] or (song_cache["artists"][0]["name"] == song["artists"][0]["name"]
                                                        and song_cache["name"] == song["name"]):
                    return
            for art in song["artists"]:
                dictionary = {"name": art["name"], "uri": art["uri"]}
                artists.append(dictionary)
            refined_song = {
                "name": song["name"],
                "artists": artists,
                "uri": song["uri"],
                "image": album_art_path + song["album"]["id"] + ".jpg"}
            # download album art
            url = song["album"]["images"][2]["url"]
            id_ = song["album"]["id"]
            if not os.path.isfile(album_art_path + id_ + ".jpg"):
                self.download_image(album_art_path, url, id_)
            data["songs"].append(refined_song)
            data["length"] = data["length"] + 1
        os.remove(filename)
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)

    def download_image(self, path, url, id_):
        img_data = requests.get(url).content
        with open(path + id_ + '.jpg', 'wb') as handler:
            handler.write(img_data)

    def is_song_playing(self):
        return self.sp.current_playback()["is_playing"]

    def toggle_playback(self, *refresh_method: classmethod):
        if self.sp.current_playback()["is_playing"]:
            self.sp.pause_playback(self.current_device_id)
        else:
            self.sp.start_playback(self.current_device_id)
        for refresh in refresh_method:  # the refresh_method arg should only contain one class method
            refresh()

    def is_shuffle_on(self):
        return self.sp.current_playback()["shuffle_state"]

    def cache_playlists(self):
        results = self.sp.user_playlists(self.username)
        playlists = results["items"]
        while results['next']:
            results = self.sp.next(results)
            playlists.extend(results["items"])
        for playlist in playlists:
            self.add_playlist_to_json(playlist)

    def like_song_toggle(self, *refresh_method: classmethod):  # used to immediately refresh a svg
        current_song = self.sp.current_user_playing_track()["item"]
        if not self.is_current_song_liked():
            self.sp.current_user_saved_tracks_add([current_song["uri"]])
        else:
            self.sp.current_user_saved_tracks_delete([current_song["uri"]])
        for refresh in refresh_method:  # the refresh_method arg should only contain one class method
            refresh()

    def is_current_song_liked(self):
        current_song = self.sp.currently_playing()["item"]
        if self.sp.current_user_saved_tracks_contains([current_song["id"]])[0]:
            return True
        else:
            return False
    
    def set_device(self, device_id):
        self.current_device_id = device_id

    def playlist_cache_search(self, prefix, term, matched):
        with open(playlist_cache_file_path, 'r') as f:
            data = json.load(f)
            for playlist in data["playlists"]:
                if len(matched) >= 5:
                    return
                if len(playlist["name"]) >= len(term):
                    if playlist["name"][:len(term)].lower() == term:
                        creator = playlist["owner"]
                        playlist = {"icon": playlist["image"], "title": playlist["name"],
                                    "description": f"Playlist by {creator}",
                                    "prefix": [prefix + playlist["name"] + f" {creator}"]}
                        matched.append(playlist)

    def add_playlist_to_json(self, playlist):
        filename = playlist_cache_file_path
        with open(filename, 'r') as f:
            data = json.load(f)
            for playlist_cache in data["playlists"]:
                if playlist_cache["uri"] == playlist["uri"]:
                    return
            # download album art
            if len(playlist["images"]) == 1:
                url = playlist["images"][0]["url"]
            else:
                url = playlist["images"][2]["url"]
            id_ = playlist["id"]
            if not os.path.isfile(album_art_path + id_ + ".jpg"):
                self.download_image(album_art_path, url, id_)
            refined_playlist = {"name": playlist["name"], "owner": playlist["owner"]["display_name"],
                                "image": album_art_path + id_ + ".jpg",
                                "uri": playlist["uri"]}
            data["playlists"].append(refined_playlist)
            data["length"] = data["length"] + 1
        os.remove(filename)
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)

    def play_playlist(self, playlist_id):
        results = self.sp.playlist_tracks(playlist_id=playlist_id)
        tracks = results["items"]
        while results["next"]:
            results = self.sp.next(results)
            tracks.extend(results["items"])
        uris = []
        for track in tracks:
            uris.append(track["track"]["uri"])
            self.add_song_to_json(track["track"])
        self.sp.start_playback(self.current_device_id, None, uris=uris)

    def goto(self, time):
        """Get Seconds from time."""
        time_standard = str(time).count(":")
        if time_standard == 1:
            time = "0:" + str(time)
        h, m, s = time.split(':')
        time = (int(h) * 3600 + int(m) * 60 + int(s)) * 1000
        try:
            self.sp.seek_track(time, self.current_device_id)
            self.resume_playback()
        except:
            None

    def play_liked(self):
        # TODO FIX THIS METHOD
        results = self.sp.current_user_saved_tracks()
        tracks = results["items"]
        uris = []
        while results["next"]:
            results = self.sp.next(results)
            tracks.extend(results["items"])
        for track in tracks:
            uris.append(track["track"]["uri"])
            self.add_song_to_json(track["track"])
        self.sp.start_playback(self.current_device_id, None, uris=uris)

    def shuffle_toggle(self, *refresh_method: classmethod):
        if self.shuffle == False:
            self.shuffle = True
            self.sp.shuffle(self.shuffle, self.current_device_id)
            self.command_list["Shuffle"]["title"] = "Shuffle (ON)"
        else:
            self.shuffle = False
            self.sp.shuffle(self.shuffle, self.current_device_id)
            self.command_list["Shuffle"]["title"] = "Shuffle (OFF)"
        for refresh in refresh_method:  # the refresh_method arg should only contain one class method
            refresh()

    def queue_song(self, song_input):
        song_uri = self.get_song_uri(song_input)
        self.sp.add_to_queue(song_uri, self.current_device_id)

    def pause_playback(self):
        self.sp.pause_playback(self.current_device_id)

    def resume_playback(self):
        self.sp.start_playback(self.current_device_id)

    def change_vol(self, value):
        try:
            int_ = int(value)
            if 0 <= int_ <= 100:
                self.sp.volume(int_, self.current_device_id)
        except:
            None

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

    def get_song_suggestions(self, command, term):
        with open(song_cache_file_path, 'r') as f:
            data = json.load(f)
            first_command = copy.deepcopy(command)
            first_command["title"] = f'{command["title"]} "{term}"'
            first_command["exe_on_return"] = 1
            first_command["term"] = term
            matched = [first_command]
            data["songs"].reverse()
            for song in data["songs"]:
                if len(matched) >= 6:
                    break
                if len(song["name"]) >= len(term):
                    if song["name"][:len(term)].lower() == term:
                        new_command = copy.deepcopy(command)
                        artists_string = ""
                        for artist in song["artists"]:
                            artists_string += artist["name"] + ", "
                        artists_string = artists_string[:-2]
                        new_command["icon"] = song["image"]
                        new_command["title"] = song["name"]
                        new_command["description"] = f"By {artists_string}"
                        new_command["term"] = f"{song['uri']}"
                        new_command["exe_on_return"] = 1
                        matched.append(new_command)
        # for sorting commands into alphabetical order
        matched_sorted = [first_command]
        matched.remove(first_command)
        matched_sorted.extend(sorted(matched, key=lambda k: k["title"]))
        return matched_sorted

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

    def refresh_token(self):
        return spotipy.util.prompt_for_user_token(self.username, scope=self.scope, client_id=self.client_id, client_secret=self.client_secret,
                                                redirect_uri=self.redirect_uri)

    command_list = \
        {"Play": {"title": "Play", "description": "Plays a song", "prefix": ["play "], "function": play_song,
                  "icon": f"{ASSETS_DIR}/svg/play.svg", "visual": 0, "parameter": 1, "match_change": 1, "exe_on_return": 0,
                  "term": ""},
         "Queue": {"title": "Queue", "description": "Adds a song to the queue", "prefix": ["queue "],
                   "function": queue_song, "icon": f"{ASSETS_DIR}/svg/list.svg", "visual": 0, "parameter": 1,
                   "match_change": 1,
                   "exe_on_return": 0, "term": ""},
         "Pause": {"title": "Pause", "description": "Pauses currently playing music", "prefix": ["pause"],
                   "function": pause_playback, "icon": f"{ASSETS_DIR}/svg/pause.svg", "visual": 0, "parameter": 0,
                   "match_change": 0, "exe_on_return": 1},
         "Playlist": {"title": "Playlist", "description": "Plays a playlist", "prefix": ["playlist "],
                      "function": play_playlist, "icon": f"{ASSETS_DIR}/svg/playlist.svg", "visual": 0, "parameter": 1,
                      "match_change": 1, "exe_on_return": 0, "term": ""},
         "Liked": {"title": "Liked", "description": "Plays liked music", "prefix": ["liked"], "function": play_liked,
                   "icon": f"{ASSETS_DIR}/svg/heart.svg", "visual": 0, "parameter": 0, "match_change": 0,
                   "exe_on_return": 1},
         "Volume": {"title": "Volume", "description": "Changes music volume (1-100)", "prefix": ["volume ", "vol "],
                    "function": change_vol, "icon": f"{ASSETS_DIR}/svg/volume.svg", "visual": 0, "parameter": 1,
                    "match_change": 0,
                    "exe_on_return": 0, "term": ""},
         "Goto": {"title": "Go to", "description": "Skips to time e.g. 3:41", "prefix": ["goto", "go to"],
                  "function": goto, "icon": f"{ASSETS_DIR}/svg/forward.svg", "visual": 0, "parameter": 1,
                  "match_change": 0,
                  "exe_on_return": 0, "term": ""},
         "Resume": {"title": "Resume", "description": "Resumes music playback", "prefix": ["resume", "start"],
                    "function": resume_playback, "icon": f"{ASSETS_DIR}/svg/play.svg", "visual": 0, "parameter": 0,
                    "match_change": 0, "exe_on_return": 1},
         "Skip": {"title": "Skip", "description": "Skips the current song", "prefix": ["skip", "next"],
                  "function": next_song, "icon": f"{ASSETS_DIR}/svg/forward.svg", "visual": 0, "parameter": 0,
                  "match_change": 0,
                  "exe_on_return": 1},
         "Previous": {"title": "Previous", "description": "Plays previous song", "prefix": ["previous", "prev"],
                      "function": previous_song, "icon": f"{ASSETS_DIR}/svg/backward.svg", "visual": 0, "parameter": 0,
                      "match_change": 0, "exe_on_return": 1},
         "Exit": {"title": "Exit", "description": "Exit Spotlightify", "prefix": ["exit"],
                  "function": print("exit"), "icon": f"{ASSETS_DIR}/svg/moon.svg", "visual": 1, "parameter": 0,
                  "match_change": 0, "exe_on_return": 1},
         "Shuffle": {"title": r"Shuffle (OFF)", "description": "Toggles shuffle mode", "prefix": ["shuffle"],
                     "function": shuffle_toggle, "icon": f"{ASSETS_DIR}/svg/shuffle.svg", "visual": 0, "parameter": 0,
                     "match_change": 0, "exe_on_return": 1},
         "Device": {"title": r"Device", "description": "Select device to play music from", "prefix": ["device"],
                     "function": set_device, "icon": f"{ASSETS_DIR}/svg/device.svg", "visual": 0, "parameter": 1,
                     "match_change": 1, "exe_on_return": 0}
         }

# File Names
song_cache_file_path = f"{ROOT_DIR}/cache/songs.json"
playlist_cache_file_path = f"{ROOT_DIR}/cache/playlists.json"
album_cache_file_path = f"{ROOT_DIR}/cache/albums.json"
artist_cache_file_path = f"{ROOT_DIR}/cache/artists.json"
album_art_path = f"{ROOT_DIR}/cache/art/"
