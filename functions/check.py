import spotipy


class CheckFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp

    def is_song_playing(self) -> bool:
        pass

    def is_shuffle_on(self) -> bool:
        pass

    def is_song_liked(self) -> bool:
        pass
