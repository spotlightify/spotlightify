from threading import Thread
from os import path, sep, mkdir
from json import load, dump
from datetime import datetime, timedelta
from definitions import CACHE_DIR
from colors import colors
from requests import get


class CachingThread(Thread):
    def __init__(self, sp, file):
        Thread.__init__(self)
        self.sp = sp
        self.file = file
        self.data = None
        self.file_path = f"{CACHE_DIR}/test_{self.file}.json"
        self.title = f"[CACHE THREAD] {colors.BLUE}{file}.json{colors.RESET}  "
        print(f"{self.title}Initialised")

    def open_file(self):
        default_data = {"length": 0, f"{self.file}": {}, "last_updated": str(datetime.now())}

        try:
            if path.isfile(self.file_path):
                print(f"Opening {self.file}.json")
                with open(self.file_path, 'r') as file:
                    data = load(file)
                    self.data = data
            else:
                self.data = default_data
        except:
            self.data = default_data

    def download_image(self, path_, url, id_):
        if not path.exists(path_):
            mkdir(path_)
        image_path = path_ + id_ + '.jpg'
        if not path.isfile(image_path):
            image_data = get(url).content
            with open(image_path, 'wb') as handler:
                handler.write(image_data)

    def cache_playlists(self):
        art_path = f"{CACHE_DIR}{sep}art-temp{sep}"

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

            playlist_id = playlist["id"]
            if not path.isfile(art_path + playlist_id + ".jpg"):
                self.download_image(art_path, url, playlist_id)

            self.data[self.file][playlist_id] = {
                "name": playlist["name"],
                "owner": playlist["owner"]["display_name"],
                "image": f"{art_path}{playlist['id']}.jpg",
                "uri": playlist["uri"]
            }
            self.data["length"] = len(self.data[self.file].keys())
            self.data["last_updated"] = str(datetime.now())

        with open(self.file_path, 'w') as file:
            dump(self.data, file, indent=4)

    def run(self):
        print(f"{self.title}Starting")
        self.open_file()

        if self.file == "playlist":
            self.cache_playlists()

        print(f"{self.title}Terminating")
        return

#     last_updated = datetime.strptime(current_data["last_updated"], "%Y-%m-%d %H:%M:%S.%f")
#     now = datetime.now()
#     time_ago = now - timedelta(hours=1)
#     # if time_ago <= last_updated <= now:
