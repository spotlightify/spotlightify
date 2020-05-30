from threading import Thread
from queue import Queue
from os import path, sep, mkdir
from json import load, dump
from datetime import datetime, timedelta
from definitions import CACHE_DIR
from colors import colors
from requests import get
from time import sleep
from pprint import pprint


def save_data_to_file(data, file):
    try:
        with open(file, "w") as f:
            dump(data, f, separators=(',', ':'))
    except:
        print(f"error saving {file}")


class ImageQueue(Queue):
    def put_image(self, file, url):
        self.put({"file": file, "url": url})


# class SongQueue(Queue):
#     def put_song(self, data):


class SongCachingThread(Thread):
    def __init__(self, queue: Queue, image_queue: ImageQueue):
        Thread.__init__(self)
        self.title = f"[{colors.WARNING}CACHE{colors.RESET}]\t"
        self.queue = queue
        self.image_queue = image_queue

    def cache_songs(self, songs):
        song_path = f"{CACHE_DIR}/test-songs.json"

        data = {"length": 0, "songs": {}, "last_updated": str(datetime.now())}
        last = None

        try:
            if path.isfile(song_path):
                with open(song_path, "r") as file:
                    data = load(file)

            for song in songs:
                print("song caching")
                track = song["track"]
                last = track["album"]["images"]
                artists = ""
                for artist in track["artists"]:
                    if artists == "":
                        artists = artist["name"]
                    else:
                        artists += ", " + artist["name"]

                # determine url to use for image
                images = track["album"]["images"]
                try:
                    if len(images) == 3:
                        self.image_queue.put_image(track["album"]["id"], images[2]["url"])
                    else:
                        self.image_queue.put_image(track["album"]["id"], images[0]["url"])
                except:
                    print(f"[ERROR] No image found for song name: {track['name']}")

                data["songs"][track["id"]] = {
                    "name": track["name"],
                    "artist": artists,
                    "image": track["album"]["id"]
                }

            data["length"] = len(data["songs"])
            data["last_updated"] = str(datetime.now())

            save_data_to_file(data, song_path)

        except:
            print("Exception")
            print(last)

    def run(self):
        print(f"{self.title}Starting")

        while True:
            song_data = []

            while not self.queue.empty():
                data = self.queue.get()
                if not isinstance(data, list):
                    data = [data]
                song_data.extend(data)
                print(f"Songs being cached: {len(data)}")

            if len(song_data) > 0:
                self.cache_songs(song_data)
                song_data = []
            else:
                sleep(30)


class CachingThread(Thread):
    def __init__(self, sp, cache_type, queue: Queue, image_queue: ImageQueue):
        Thread.__init__(self)
        self.sp = sp
        self.cache_type = cache_type
        self.title = f"[{colors.BLUE}CACHE{colors.RESET}]\t"
        self.queue = queue
        self.image_queue = image_queue
        print(f"{self.title}Initialised")

    def cache_playlists(self):
        start_time = datetime.now()

        playlists_path = f"{CACHE_DIR}/test-playlists.json"

        data = {"length": 0, "playlists": {}, "last_updated": ""}

        try:
            if path.isfile(playlists_path):
                with open(playlists_path, "r") as file:
                    data = load(file)
                    last_updated = datetime.strptime(data["last_updated"], "%Y-%m-%d %H:%M:%S.%f")
                    now = datetime.now()
                    time_ago = now - timedelta(days=1)
                    if time_ago <= last_updated <= now:
                        print(f"{self.title}Caching playlists skipped, last updated {last_updated}")
                        return

            results = self.sp.current_user_playlists()
            playlist_data = results["items"]
            while results["next"]:
                results = self.sp.next(results)
                playlist_data.extend(results["items"])

            for playlist in playlist_data:
                # download album art
                try:
                    if len(playlist["images"]) == 1:
                        url = playlist["images"][0]["url"]
                    else:
                        url = playlist["images"][2]["url"]
                except IndexError:
                    print("Error occurred getting image for playlist", playlist)
                self.image_queue.put_image(playlist["id"], url)

                data["playlists"][playlist["id"]] = {
                    "name": playlist["name"],
                    "owner": playlist["owner"]["display_name"],
                    "image": playlist["id"]
                }

            data["length"] = len(data["playlists"].keys())
            data["last_updated"] = str(datetime.now())

            save_data_to_file(data, playlists_path)

            for key in data["playlists"].keys():
                results = self.sp.user_playlist_tracks(playlist_id=key)  # , fields="items,next"
                songs_to_add = results["items"]
                while results["next"]:
                    results = self.sp.next(results)
                    songs_to_add.extend(results["items"])

                self.queue.put(songs_to_add)

        except:
            None

        end_time = datetime.now()
        print(f"{colors.WARNING}DURATION: {end_time - start_time}{colors.RESET}")

    def cache_liked_songs(self):
        results = self.sp.current_user_saved_tracks()
        tracks = results["items"]
        while results["next"]:
            results = self.sp.next(results)
            tracks.extend(results["items"])
        print(f"\n {colors.WARNING}{len(tracks)}{colors.RESET}")
        self.queue.put(tracks)

    def run(self):
        print(f"{self.title}Starting")
        if self.cache_type == "playlists":
            self.cache_playlists()
        elif self.cache_type == "liked":
            self.cache_liked_songs()
        print(f"{self.title}Terminating")
        return


class ImageCachingThread(Thread):
    def __init__(self, image_queue: ImageQueue):
        Thread.__init__(self)
        self.image_queue = image_queue

    @staticmethod
    def download_image(url, file_name):
        art_path = f"{CACHE_DIR}{sep}art-temp{sep}"

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
