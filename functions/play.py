from queue import Queue

import spotipy


class PlayFunctions:
    def __init__(self, sp: spotipy.Spotify, queue: Queue):
        self.sp = sp
        self.queue = queue

    def term(self, term: str):
        pass

    def uri(self, uri: str):
        pass

    def id(self, id: str):
        pass

    def liked_songs(self):
        pass
