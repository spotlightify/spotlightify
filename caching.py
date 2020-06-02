from threading import Thread
from queues import SongQueue, ImageQueue
from json import dump
from spotipy import Spotify
from colors import colors
from threads import SongCachingThread, ImageCachingThread, PlaylistCachingThread, LikedCachingThread, \
    AlbumCachingThread, ArtistCachingThread
from os import mkdir, path
from definitions import CACHE_DIR


def save_data_to_file(data, file):
    try:
        with open(file, "w") as f:
            dump(data, f, separators=(',', ':'))
    except:
        print(f"error saving {file}")


class CacheManager(Thread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        Thread.__init__(self)
        self.create_cache()

        self.sp = sp
        self.song_queue = song_queue
        self.image_queue = image_queue

        self.song_cache_thread = SongCachingThread(self.song_queue, self.image_queue)
        self.image_cache_thread = ImageCachingThread(self.image_queue)

        self.playlist_cache_thread = PlaylistCachingThread(self.sp, self.song_queue, self.image_queue)
        self.liked_cache_thread = LikedCachingThread(self.sp, self.song_queue)
        self.album_cache_thread = AlbumCachingThread(self.sp, self.song_queue, self.image_queue)
        self.artist_cache_thread = ArtistCachingThread(self.sp, self.song_queue, self.image_queue)

        print(f"{colors.BLUE}CacheManager initialised{colors.RESET}")

        self.start()

    @staticmethod
    def create_cache():
        if not path.exists(CACHE_DIR):
            mkdir(CACHE_DIR)

    def run(self):
        self.song_cache_thread.start()
        self.image_cache_thread.start()

        self.playlist_cache_thread.start()
        self.liked_cache_thread.start()
        self.album_cache_thread.start()
        self.artist_cache_thread.start()
