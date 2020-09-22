import json
from os import sep
from datetime import datetime
from definitions import CACHE_DIR


class CacheHolder:
    """Holds cached data
    """
    playlist_cache = {"length": 0, "playlists": {} }
    song_cache = {"length": 0, "songs": {} }
    artist_cache = {"length": 0, "artist": {} }
    album_cache = {"length": 0, "playlists": {} }
    liked_cache = {"length": 0, "songs": {} }
    last_refresh = datetime.now()

    @staticmethod
    def check_reload(_type: str):  # will refresh every 5 minutes (300 seconds)
        """Reloads cached items if time since last reload has surpassed 5 minutes

        Args:
            _type (str): Either song, playlist, artist, album or all
        """
        time_passed = (datetime.now() - CacheHolder.last_refresh).total_seconds()
        if time_passed > 150:
            CacheHolder.last_refresh = datetime.now()
            CacheHolder.reload_holder(_type)

    @staticmethod
    def reload_holder(_type: str):
        '''
        Reloads data to static variables inside of this class, use the check_reload method if you want the cache to refresh only once every 5 mins
        :param _type: Either song, playlist, artist, album or all
        :return:
        '''
        # load cached songs
        def sort(cache: dict, type: str):
            """
            Sorts dictionary items into alphabetical order
            :param cache:
            :param type:
            :return:
            """
            items = cache[type]
            cache[type] = dict(sorted(items.items(), key=lambda x: x[1]['name']))

        try:
            print("[CACHE HOLDER] Reloading JSON File")
            if _type == "song" or _type == "all":
                with open(song_cache_file_path, 'r') as f:
                    CacheHolder.song_cache = json.load(f)
                    sort(CacheHolder.song_cache, "songs")
                    # load cached artists
            if _type == "artist" or _type == "all":
                with open(artist_cache_file_path, 'r') as f:
                    CacheHolder.artist_cache = json.load(f)
                    sort(CacheHolder.artist_cache, "artists")
            # load cached albums
            if _type == "album" or _type == "all":
                with open(album_cache_file_path, 'r') as f:
                    CacheHolder.album_cache = json.load(f)
                    sort(CacheHolder.album_cache, "albums")
            # load cached playlists
            if _type == "playlist" or _type == "all":
                with open(playlist_cache_file_path, 'r') as f:
                    CacheHolder.playlist_cache = json.load(f)
                    sort(CacheHolder.playlist_cache, "playlists")
            # load cache liked tracks
            if _type == "liked" or _type == "all":
                with open(liked_cache_file_path, 'r') as f:
                    CacheHolder.liked_cache = json.load(f)
                    sort(CacheHolder.liked_cache, "songs")
            print("[CACHE HOLDER] Reload Complete")
        except:
            None  # First time startup with no cache, TODO make the except more precise


# Cached file paths
song_cache_file_path = f"{CACHE_DIR}songs.json"
playlist_cache_file_path = f"{CACHE_DIR}playlists.json"
album_cache_file_path = f"{CACHE_DIR}albums.json"
artist_cache_file_path = f"{CACHE_DIR}artists.json"
liked_cache_file_path = f"{CACHE_DIR}liked.json"
album_art_path = f"{CACHE_DIR}art{sep}"
