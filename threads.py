from threading import Thread
from os import path, sep, mkdir
from json import load, dump
from spotipy import Spotify
from datetime import datetime, timedelta
from colors import colors
from requests import get
from time import sleep
from definitions import CACHE_DIR
from queues import SongQueue, ImageQueue

songs_path = f"{CACHE_DIR}songs.json"
playlists_path = f"{CACHE_DIR}playlists.json"
artists_path = f"{CACHE_DIR}artists.json"
albums_path = f"{CACHE_DIR}albums.json"


def save_data_to_file(data, file):
    try:
        with open(file, "w") as f:
            dump(data, f, separators=(',', ':'))
    except:
        print(f"error saving {file}")


def check_time(updated):
    try:
        last_updated = datetime.strptime(updated, "%Y-%m-%d %H:%M:%S.%f")
        now = datetime.now()
        time_ago = now - timedelta(days=1)
        if time_ago <= last_updated <= now:
            return True
        else:
            return False
    except:
        return False


def get_all(sp: Spotify, result):
    print("get_all()", len(result["items"]))
    data = result["items"]
    while result["next"]:
        try:
            result = sp.next(data)
            data.extend(result["items"])
        except Exception as e:
            print(e)
    print(data)
    return data


def combine_artists(data):
    artists = ""
    for artist in data["artists"]:
        if artists == "":
            artists = artist["name"]
        else:
            artists += ", " + artist["name"]
    return artists


# def open_file_if_exists(file_path, default):


class SongCachingThread(Thread):
    def __init__(self, song_queue: SongQueue, image_queue: ImageQueue):
        Thread.__init__(self)
        self.song_queue = song_queue
        self.image_queue = image_queue

    def cache_songs(self, songs):
        data = {"length": 0, "songs": {}, "last_updated": ""}

        if path.isfile(songs_path):
            with open(songs_path, "r") as file:
                data = load(file)

        for song in songs:
            try:
                if "track" in song:
                    song = song["track"]

                if song["is_local"]:
                    print(f"Skipping local track {colors.WARNING}{song['name']}{colors.RESET}")
                    continue

                image = ""

                try:
                    # determine url to use for image
                    images = song["album"]["images"]
                    if len(images) == 3:
                        self.image_queue.put_image(song["album"]["id"], images[2]["url"])
                    else:
                        self.image_queue.put_image(song["album"]["id"], images[0]["url"])
                    image = song["album"]["id"]
                except:
                    print(f"[ERROR] No image found for song name: {song['name']}")

                data["songs"][song["id"]] = {
                    "name": song["name"],
                    "artist": combine_artists(song),
                    "image": image
                }
            except Exception as ex:
                print(ex)

        data["length"] = len(data["songs"])
        data["last_updated"] = str(datetime.now())

        save_data_to_file(data, songs_path)

    def run(self):
        while True:
            song_data = []

            while not self.song_queue.empty():
                data = self.song_queue.get()
                if not isinstance(data, list):
                    data = [data]
                song_data.extend(data)

            if len(song_data) > 0:
                self.cache_songs(song_data)
            else:
                sleep(30)


class ImageCachingThread(Thread):
    def __init__(self, image_queue: ImageQueue):
        Thread.__init__(self)
        self.image_queue = image_queue

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
            print(f"Error occurred saving file {colors.FAIL}{file_name}.jpg{colors.RESET}")

    def run(self):
        print("Starting image cache thread")

        while True:
            while not self.image_queue.empty():
                image = self.image_queue.get()
                self.download_image(image["url"], image["file"])
            sleep(30)


class PlaylistCachingThread(Thread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        Thread.__init__(self)

        self.sp = sp
        self.song_queue = song_queue
        self.image_queue = image_queue

    def run(self):
        data = {"length": 0, "playlists": {}, "last_updated": ""}

        # try:
        if path.isfile(playlists_path):
            with open(playlists_path, "r") as file:
                data = load(file)
                if check_time(data["last_updated"]):
                    print("skipping playlists caching")
                    return

        result = self.sp.current_user_playlists()
        playlist_data = result["items"]
        while result["next"]:
            result = self.sp.next(result)
            playlist_data.extend(result["items"])

        for playlist in playlist_data:
            # download album art
            try:
                if len(playlist["images"]) == 1:
                    url = playlist["images"][0]["url"]
                else:
                    url = playlist["images"][2]["url"]
                self.image_queue.put_image(playlist["id"], url)

            except IndexError:
                print("Error occurred getting image for playlist", playlist)

            data["playlists"][playlist["id"]] = {
                "name": playlist["name"],
                "owner": playlist["owner"]["display_name"],
                "image": playlist["id"]
            }

        data["length"] = len(data["playlists"].keys())
        data["last_updated"] = str(datetime.now())

        save_data_to_file(data, playlists_path)

        for key in data["playlists"].keys():
            result = self.sp.playlist_tracks(playlist_id=key)
            song_data = result["items"]

            while result["next"]:
                result = self.sp.next(result)
                song_data.extend(result["items"])

            self.song_queue.put(song_data)


class LikedCachingThread(Thread):
    def __init__(self, sp: Spotify, song_queue: SongQueue):
        Thread.__init__(self)

        self.sp = sp
        self.song_queue = song_queue

    def run(self):
        try:
            result = self.sp.current_user_saved_tracks()
            liked_data = result["items"]
            while result["next"]:
                result = self.sp.next(result)
                liked_data.extend(result["items"])

            self.song_queue.put(liked_data)

        except Exception as ex:
            print(ex)


class AlbumCachingThread(Thread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        Thread.__init__(self)

        self.sp = sp
        self.song_queue = song_queue
        self.image_queue = image_queue

    def run(self):
        data = {"length": 0, "albums": {}, "last_updated": ""}

        try:
            if path.isfile(albums_path):
                with open(albums_path, "r") as file:
                    data = load(file)
                    if check_time(data["last_updated"]):
                        print("skipping albums caching")
                        return

            result = self.sp.current_user_saved_albums()
            album_data = result["items"]

            while result["next"]:
                result = self.sp.next(result)
                album_data.extend(result["items"])

            for album in album_data:
                album = album["album"]

                # download album art
                try:
                    if len(album["images"]) == 1:
                        url = album["images"][0]["url"]
                    else:
                        url = album["images"][2]["url"]
                    self.image_queue.put_image(album["id"], url)

                except IndexError:
                    print("Error occurred getting image for album", album)

                result = self.sp.album_tracks(album_id=album["id"])
                song_data = result["items"]

                while result["next"]:
                    song_data.extend(result["items"])

                self.song_queue.put(song_data)

                songs_list = []
                song_index = 0
                for song in song_data:
                    songs_list.append(song["id"])

                    temp_song = song_data[song_index]
                    temp_song["album"] = album
                    song_data[song_index] = temp_song

                    song_index += 1

                data["albums"][album["id"]] = {
                    "name": album["name"],
                    "artist": combine_artists(album),
                    "image": album["id"],
                    "songs": songs_list
                }

            data["length"] = len(data["albums"].keys())
            data["last_updated"] = str(datetime.now())

            save_data_to_file(data, albums_path)

        except Exception as ex:
            print("fuc")
            print(ex)


class ArtistCachingThread(Thread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        Thread.__init__(self)

        self.sp = sp
        self.song_queue = song_queue
        self.image_queue = image_queue

    def run(self):
        data = {"length": 0, "artists": {}, "last_updated": ""}

        if path.isfile(artists_path):
            with open(artists_path, "r") as file:
                data = load(file)
                if check_time(data["last_updated"]):
                    print("skipping artists caching")
                    return

        result = self.sp.current_user_followed_artists()["artists"]
        artist_data = result["items"]

        while result["next"]:
            result = self.sp.next(result)["artists"]
            artist_data.extend(result["items"])

        print(artist_data)

        for artist in artist_data:
            # download art
            try:
                if len(artist["images"]) == 1:
                    url = artist["images"][0]["url"]
                else:
                    url = artist["images"][2]["url"]
                self.image_queue.put_image(artist["id"], url)

            except IndexError:
                print("Error occurred getting image for artist", artist)

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

        save_data_to_file(data, artists_path)

        for key in data["artists"].keys():
            result = self.sp.artist_top_tracks(artist_id=key)
            song_data = result["tracks"]
            self.song_queue.put(song_data)
