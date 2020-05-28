from threading import Thread
from os import path, sep, mkdir
from json import load, dump
from datetime import datetime, timedelta
from definitions import CACHE_DIR
from colors import colors
from requests import get


class CachingThread(Thread):
    def __init__(self, sp):
        Thread.__init__(self)
        self.sp = sp
        self.title = f"[{colors.BLUE}CACHE THREAD{colors.RESET}]\t"
        print(f"{self.title}Initialised")

    @staticmethod
    def download_image(url, file_name):
        art_path = f"{CACHE_DIR}{sep}art-temp{sep}"

        if not path.exists(art_path):
            mkdir(art_path)
        image_path = art_path + file_name + ".jpg"
        if not path.isfile(image_path):
            image_data = get(url).content
            with open(image_path, 'wb') as handler:
                handler.write(image_data)

    @staticmethod
    def save_data_to_file(data, file):
        try:
            with open(file, "w") as f:
                dump(data, f, separators=(',', ':'))
        except:
            print(f"error saving {file}")

    def cache_songs(self, songs):
        song_path = f"{CACHE_DIR}/test-songs.json"

        data = {"length": 0, "songs": {}, "last_updated": str(datetime.now())}

        try:
            if path.isfile(song_path):
                with open(song_path, "r") as file:
                    data = load(file)

            for song in songs:
                artists = ""
                for artist in song["artists"]:
                    artists += " " + artist["name"]
                artists = artists.strip()

                self.download_image(song["album"]["images"][2]["url"], song["album"]["id"])

                data["songs"][song["id"]] = {
                    "name": song["name"],
                    "artists": artists,
                    "uri": song["uri"],
                    "image": song["album"]["id"]
                }

            data["length"]: len(data["songs"].keys())
            data["last_updated"]: str(datetime.now())

            self.save_data_to_file(data, song_path)

        except:
            None

    def cache_playlists(self):
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

            print(f"{self.title}{colors.GREEN}Data{colors.RESET}", playlist_data)

            for playlist in playlist_data:
                # download album art
                try:
                    if len(playlist["images"]) == 1:
                        url = playlist["images"][0]["url"]
                    else:
                        url = playlist["images"][2]["url"]
                except IndexError:
                    print(IndexError)

                self.download_image(url, playlist["id"])

                data["playlists"][playlist["id"]] = {
                    "name": playlist["name"],
                    "owner": playlist["owner"]["display_name"],
                    "uri": playlist["uri"],
                    "image": playlist["id"]
                }

            data["length"] = len(data["playlists"].keys())
            data["last_updated"] = str(datetime.now())

            self.save_data_to_file(data, playlists_path)

        except:
            None

    # def cache_saved(self):
    #     print('')

    def run(self):
        print(f"{self.title}Starting")
        self.cache_playlists()

        print(f"{self.title}Terminating")
        return

# last_updated = datetime.strptime(current_data["last_updated"], "%Y-%m-%d %H:%M:%S.%f")
# now = datetime.now()
# time_ago = now - timedelta(hours=1)
# if time_ago <= last_updated <= now:
