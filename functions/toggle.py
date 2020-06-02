import spotipy


class ToggleFunctions:
    def __init__(self, sp: spotipy.Spotify):
        self.sp = sp

    def like_song(self):
        pass

    def shuffle(self):  # return description string for command
        pass

    def shuffle(self, state: bool):
        pass

    def playback(self):
        pass

    def playback(self, state: bool):
        pass

    def repeat(self):  # return description string for command
        pass

    def _is_repeat_context(self) -> bool:  # potentially put inside repeat method
        pass

    def _is_repeat_track(self) -> bool:  # potentially put inside repeat method
        pass
