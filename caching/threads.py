from threading import Thread
from os import path, sep, mkdir
from json import load, dump
from spotipy import Spotify
from datetime import datetime, timedelta
from colors import colors
from requests import get
from time import sleep
from definitions import CACHE_DIR
from caching.queues import SongQueue, ImageQueue

songs_path = f"{CACHE_DIR}songs.json"
playlists_path = f"{CACHE_DIR}playlists.json"
artists_path = f"{CACHE_DIR}artists.json"
albums_path = f"{CACHE_DIR}albums.json"
liked_path = f"{CACHE_DIR}liked.json"


class CacheThread(Thread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        Thread.__init__(self)
        self.sp = sp
        self.song_queue = song_queue
        self.image_queue = image_queue
        self.is_working = False
        self.title = self.get_title()

        print(f"{self.title} Initialised")

    @staticmethod
    def open_if_exists(file_path: str, default_data: object):
        data = default_data
        try:
            if path.isfile(file_path):
                with open(file_path, "r") as file:
                    data = load(file)
            return data
        except:
            return default_data

    @staticmethod
    def save_data(file_path: str, data: object):
        try:
            with open(file_path, "w") as f:
                dump(data, f, separators=(',', ':'))
        except:
            print(f"error saving {file_path}")

    def check_time(self, updated: str):
        try:
            last_updated = datetime.strptime(updated, "%Y-%m-%d %H:%M:%S.%f")
            now = datetime.now()
            time_ago = now - timedelta(days=1)
            if time_ago <= last_updated <= now:
                last_updated_str = last_updated.strftime("%c").replace("  ", " ")
                print(f"{self.title} Skipping caching, last updated {last_updated_str}")
                return True
            else:
                return False
        except:
            return False

    @staticmethod
    def combine_artists(data: object):
        artists = ""
        for artist in data["artists"]:
            if artists == "":
                artists = artist["name"]
            else:
                artists += ", " + artist["name"]
        return artists

    @staticmethod
    def default_data_template(name: str):
        entry_name = "name"
        data_template = {"length": 0, "last_updated": ""}
        if len(name) != 0:
            entry_name = name

        data_template[entry_name] = {}

        return data_template

    def get_image(self, file_id: str, data: object):
        if "images" in data:
            images_length = len(data["images"])

            if images_length > 0:
                if images_length == 1:
                    url = data["images"][0]["url"]
                else:
                    url = data["images"][-1]["url"]

                self.image_queue.put_image(file_id, url)
                return

        print("No valid image found")

    def get_all(self, initial_data: object, **kwargs):
        field = kwargs.get("field", None)

        result = initial_data
        data = result["items"]
        while result["next"]:
            if field is not None:
                result = self.sp.next(result)[field]
            else:
                result = self.sp.next(result)
            data.extend(result["items"])
        return data

    def working(self):
        return self.is_working

    def get_title(self):
        name = self.__class__.__name__.replace("CacheThread", "").upper()
        return f"[{colors.BLUE}CACHE{colors.RESET}] [{colors.YELLOW}{name}{colors.RESET}]"

    def process_songs(self, songs, file_path):
        self.is_working = True

        default_data = self.default_data_template("songs")

        data = self.open_if_exists(file_path, default_data)

        for song in songs:
            if "track" in song:
                song = song["track"]
                if song is None:
                    continue

            if song["is_local"]:
                print(f"{self.title} Skipping local track {colors.BOLD}{song['name']}{colors.RESET}")
                continue

            self.get_image(song["album"]["id"], song["album"])

            data["songs"][song["id"]] = {
                "name": song["name"],
                "artist": self.combine_artists(song),
                "image": song["album"]["id"]
            }

        data["length"] = len(data["songs"])
        data["last_updated"] = str(datetime.now())

        self.save_data(file_path, data)
        self.is_working = False


class SongCacheThread(CacheThread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        CacheThread.__init__(self, sp, song_queue, image_queue)

    def run(self):
        print(f"{self.title} Starting")

        while True:
            song_data = []
            self.is_working = False

            while not self.song_queue.empty():
                self.is_working = True
                data = self.song_queue.get()
                if not isinstance(data, list):
                    data = [data]
                song_data.extend(data)

            if len(song_data) > 0:
                self.process_songs(song_data, songs_path)
            else:
                self.is_working = False
                sleep(30)


class ImageCacheThread(CacheThread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        CacheThread.__init__(self, sp, song_queue, image_queue)

    @staticmethod
    def download_image(url, file_name):
        art_path = f"{CACHE_DIR}art{sep}"

        try:
            if not path.exists(art_path):
                mkdir(art_path)

            image_path = art_path + file_name + ".jpg"
            if not path.isfile(image_path):
                image_data = get(url).content
                with open(image_path, 'wb') as handler:
                    handler.write(image_data)
        except:
            print(f"Error occurred saving file {colors.RED}{file_name}.jpg{colors.RESET}")

    def run(self):
        print(f"{self.title} Starting")

        while True:
            while not self.image_queue.empty():
                self.is_working = True
                image = self.image_queue.get()
                self.download_image(image["url"], image["file"])
            self.is_working = False
            sleep(30)


class PlaylistCacheThread(CacheThread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        CacheThread.__init__(self, sp, song_queue, image_queue)

    def run(self):
        print(f"{self.title} Starting")

        self.is_working = True
        default_data = self.default_data_template("playlists")

        data = self.open_if_exists(playlists_path, default_data)
        if self.check_time(data["last_updated"]):
            return

        playlist_data = self.get_all(self.sp.current_user_playlists())

        for playlist in playlist_data:
            self.get_image(playlist["id"], playlist)
            data["playlists"][playlist["id"]] = {
                "name": playlist["name"],
                "owner": playlist["owner"]["display_name"],
                "image": playlist["id"]
            }

        data["length"] = len(data["playlists"].keys())
        data["last_updated"] = str(datetime.now())

        self.save_data(playlists_path, data)

        for key in data["playlists"].keys():
            song_data = self.get_all(self.sp.playlist_tracks(playlist_id=key))
            self.song_queue.put(song_data)

        self.is_working = False


class LikedCacheThread(CacheThread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        CacheThread.__init__(self, sp, song_queue, image_queue)

    def run(self):
        print(f"{self.title} Starting")
        self.is_working = True
        liked_data = self.get_all(self.sp.current_user_saved_tracks())
        self.song_queue.put(liked_data)
        self.process_songs(liked_data, liked_path)
        self.is_working = False


class AlbumCacheThread(CacheThread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        CacheThread.__init__(self, sp, song_queue, image_queue)

    def run(self):
        print(f"{self.title} Starting")

        self.is_working = True
        default_data = self.default_data_template("albums")

        data = self.open_if_exists(albums_path, default_data)
        if self.check_time(data["last_updated"]):
            return

        album_data = self.get_all(self.sp.current_user_saved_albums())

        for album in album_data:
            album = album["album"]

            self.get_image(album["id"], album)

            song_data = self.get_all(self.sp.album_tracks(album_id=album["id"]))

            # unsure if songs_list is needed or API can play an from a URI
            songs_list = []
            song_index = 0
            for song in song_data:
                songs_list.append(song["id"])

                temp_song = song_data[song_index]
                temp_song["album"] = album
                song_data[song_index] = temp_song

                song_index += 1

            self.song_queue.put(song_data)

            data["albums"][album["id"]] = {
                "name": album["name"],
                "artist": self.combine_artists(album),
                "image": album["id"],
                "songs": songs_list
            }

        data["length"] = len(data["albums"].keys())
        data["last_updated"] = str(datetime.now())

        self.save_data(albums_path, default_data)
        self.is_working = False


class ArtistCacheThread(CacheThread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        CacheThread.__init__(self, sp, song_queue, image_queue)

    def run(self):
        print(f"{self.title} Starting")

        self.is_working = True
        default_data = self.default_data_template("artists")

        data = self.open_if_exists(artists_path, default_data)

        if self.check_time(data["last_updated"]):
            return

        artist_data = self.get_all(self.sp.current_user_followed_artists()["artists"], field="artists")

        for artist in artist_data:
            self.get_image(artist["id"], artist)

            genre = "Music"
            if len(artist["genres"]) > 0:
                genre = artist["genres"][0].title()

            data["artists"][artist["id"]] = {
                "name": artist["name"],
                "genre": genre,
                "image": artist["id"]
            }

        data["length"] = len(data["artists"].keys())
        data["last_updated"] = str(datetime.now())

        self.save_data(artists_path, data)

        for key in data["artists"].keys():
            result = self.sp.artist_top_tracks(artist_id=key)
            song_data = result["tracks"]
            self.song_queue.put(song_data)

        self.is_working = False
