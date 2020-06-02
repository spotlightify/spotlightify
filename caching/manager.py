from threading import Thread
from spotipy import Spotify
from colors import colors
from os import mkdir, path
from definitions import CACHE_DIR
from caching.queues import SongQueue, ImageQueue
from caching.threads import SongCacheThread, ImageCacheThread, PlaylistCacheThread, LikedCacheThread, AlbumCacheThread, \
    ArtistCacheThread


class CacheManager(Thread):
    def __init__(self, sp: Spotify, song_queue: SongQueue, image_queue: ImageQueue):
        Thread.__init__(self)
        self.create_cache()

        self.sp = sp
        self.song_queue = song_queue
        self.image_queue = image_queue

        self.song_cache_thread = SongCacheThread(self.sp, self.song_queue, self.image_queue)
        self.image_cache_thread = ImageCacheThread(self.sp, self.song_queue, self.image_queue)

        self.playlist_cache_thread = PlaylistCacheThread(self.sp, self.song_queue, self.image_queue)
        self.liked_cache_thread = LikedCacheThread(self.sp, self.song_queue, self.image_queue)
        self.album_cache_thread = AlbumCacheThread(self.sp, self.song_queue, self.image_queue)
        self.artist_cache_thread = ArtistCacheThread(self.sp, self.song_queue, self.image_queue)

        print(f"{colors.BLUE}CacheManager initialised{colors.RESET}")

        self.start()

    @staticmethod
    def create_cache():
        if not path.exists(CACHE_DIR):
            mkdir(CACHE_DIR)

        art_path = f"{CACHE_DIR}art"
        if not path.exists(art_path):
            mkdir(art_path)

    def run(self):
        self.song_cache_thread.start()
        self.image_cache_thread.start()

        self.playlist_cache_thread.start()
        self.liked_cache_thread.start()
        self.album_cache_thread.start()
        self.artist_cache_thread.start()
