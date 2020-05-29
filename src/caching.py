from threading import Thread
from queue import Queue
from os import path, sep, mkdir
from json import load, dump
from datetime import datetime, timedelta
from definitions import CACHE_DIR
from colors import colors
from requests import get


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


def save_data_to_file(data, file):
    try:
        with open(file, "w") as f:
            dump(data, f, separators=(',', ':'))
    except:
        print(f"error saving {file}")


class SongCachingThread(Thread):
    def __init__(self, queue: Queue):
        Thread.__init__(self)
        self.title = f"[{colors.WARNING}CACHE{colors.RESET}]\t"
        self.queue = queue
        self.call_count = 0

    # @staticmethod
    def cache_songs(self, songs):
        self.call_count += 1
        print(f"{colors.WARNING}cache_songs call_count: {self.call_count}")
        song_path = f"{CACHE_DIR}/test-songs.json"

        data = {"length": 0, "songs": {}, "last_updated": str(datetime.now())}
        last = None

        try:
            if path.isfile(song_path):
                with open(song_path, "r") as file:
                    data = load(file)

            for song in songs:
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
                download_image(images[2]["url"], track["album"]["id"])

                data["songs"][track["id"]] = {
                    "name": track["name"],
                    "artists": artists,
                    "uri": track["uri"],
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
            while not self.queue.empty():
                data = self.queue.get()
                # print('saving', data)
                if not isinstance(data, list):
                    data = [data]
                self.cache_songs(data)


class CachingThread(Thread):
    def __init__(self, sp, queue: Queue):
        Thread.__init__(self)
        self.sp = sp
        self.title = f"[{colors.BLUE}CACHE{colors.RESET}]\t"
        self.queue = queue
        print(f"{self.title}Initialised")

    def cache_playlists(self):
        start_time = datetime.now()

        playlists_path = f"{CACHE_DIR}/test-playlists.json"

        data = {"length": 0, "playlists": {}, "last_updated": str(datetime.now())}

        try:
            if path.isfile(playlists_path):
                with open(playlists_path, "r") as file:
                    data = load(file)

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
                download_image(url, playlist["id"])

                data["playlists"][playlist["id"]] = {
                    "name": playlist["name"],
                    "owner": playlist["owner"]["display_name"],
                    "uri": playlist["uri"],
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

    def run(self):
        print(f"{self.title}Starting")
        self.cache_playlists()

        print(f"{self.title}Terminating")
        return

# last_updated = datetime.strptime(current_data["last_updated"], "%Y-%m-%d %H:%M:%S.%f")
# now = datetime.now()
# time_ago = now - timedelta(days=1)
# if time_ago <= last_updated <= now:
