import spotipy


class PlaybackFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp

    def skip_song(self):
        pass

    def previous(self):
        pass

    def goto(self, time):
        pass
